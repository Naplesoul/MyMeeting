import {IatRecognizer} from "./IatRecognizer"
import {RecognitionResult, SpeechText} from "./Types";
import global from "../global"
// @ts-ignore
import moment from "moment";

export class SpeechRecognition
{
    private working: boolean = null;
    private sentenceEnded: boolean = null;
    // @ts-ignore
    private currentSpeechTimestamp: moment = null;
    private readonly sendSpeechText: (text: SpeechText) => void;
    private recognizer;
    private speechCallbacks: Map<string, (speechTexts: SpeechText[]) => void> = null;
    private speechTextStorage: SpeechText[] = null;
    // fromPeerId ==> SpeechText
    private speakingSpeechTexts: Map<number, SpeechText> = null;

    constructor(sendSpeechText: (speechText: SpeechText) => void)
    {
        this.working = false;
        this.sentenceEnded = true;
        this.sendSpeechText = sendSpeechText;

        this.speechTextStorage = [];
        this.speakingSpeechTexts = new Map<number, SpeechText>();

        this.recognizer = new IatRecognizer()
        this.recognizer.onRecognizerResult = this.onRecognizerResult;
        this.recognizer.onRecognizerStop = () => {
            if (this.working) {
                this.recognizer.start();
            }
        }

        this.speechCallbacks = new Map<string, (speechTexts: SpeechText[]) => void>();
    }

    public registerSpeechListener(key: string, recognizedCallback: (speechTexts: SpeechText[]) => void)
    {
        this.speechCallbacks.set(key, recognizedCallback);
    }

    public deleteSpeechListener(key: string)
    {
        this.speechCallbacks.delete(key);
    }

    private onRecognizerResult = (recognized: RecognitionResult) => {
        const updateTime = moment();
        if (this.sentenceEnded) {
            this.currentSpeechTimestamp = updateTime;
        }
        const speechText: SpeechText = {
            fromPeerId: global.userInfo.id,
            displayName: global.userInfo.nickname,
            fromMyself: true,
            newSentence: this.sentenceEnded,
            sentenceEnded: recognized.isLast,
            text: recognized.text,
            startTime: this.currentSpeechTimestamp,
            updateTime: updateTime,
        }
        this.sentenceEnded = recognized.isLast;

        this.sendSpeechText(speechText);
        this.newSpeechText(speechText);
    }

    public recvPeerSpeech(speechText: SpeechText)
    {
        if (speechText.fromPeerId !== global.userInfo.id) {
            speechText.fromMyself = false;
            speechText.startTime = moment(speechText.startTime);
            speechText.updateTime = moment(speechText.updateTime);
            this.newSpeechText(speechText);
        }
    }

    private newSpeechText(speechText: SpeechText)
    {
        if (speechText.newSentence || !this.speakingSpeechTexts.has(speechText.fromPeerId)) {
            this.speechTextStorage.push(speechText);
            if (!speechText.sentenceEnded) {
                this.speakingSpeechTexts.set(speechText.fromPeerId, speechText);
            }
        } else {
            const existed = this.speakingSpeechTexts.get(speechText.fromPeerId);
            existed.text = speechText.text;
            existed.updateTime = speechText.updateTime;
            existed.newSentence = false;
            existed.sentenceEnded = speechText.sentenceEnded;
            if (speechText.sentenceEnded) {
                this.speakingSpeechTexts.delete(speechText.fromPeerId);
            }
        }

        const displayText = this.generateDisplayText();
        this.speechCallbacks.forEach((callback) => {
            callback(displayText);
        });
    }

    private generateDisplayText()
    {
        return this.speechTextStorage;
    }

    public exportMeme()
    {
        let meme = '';
        this.speechTextStorage.forEach((speechText) => {
            meme += `${speechText.startTime.format('hh:mm:ss a')}  ${speechText.displayName}: ${speechText.text}\n`;
        });
        return meme;
    }

    public start()
    {
        this.working = true;
        this.recognizer.start();
        console.log('[Recognizer]  Started');
    }

    public stop()
    {
        this.working = false;
        this.recognizer.stop();
        console.log('[Recognizer]  Stopped');
    }

    public clear()
    {
        if (this.working) {
            this.recognizer.stop();
        }
        this.speakingSpeechTexts.clear();
        this.speechTextStorage = [];
    }
}
