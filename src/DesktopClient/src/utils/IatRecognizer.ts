/**
 * Created by lycheng on 2019/8/1.
 * edited by shenwhang on 2021/8/23
 */

import CryptoJS from 'crypto-js';
import {TranscodeWorker} from './media/TranscodeWorker';
import {RecognitionResult, RecognitionStatus} from './Types';

const APPID = 'YourAPPID'
const API_SECRET = 'YourAPISECRET'
const API_KEY = 'YourAPIKEY'
const url = 'wss://iat-api.xfyun.cn/v2/iat'
const host = 'iat-api.xfyun.cn';
const language = 'zh_cn'
const accent = 'mandarin'
const algorithm = 'hmac-sha256'
const headers = 'host date request-line'
const speechEndTimeout = 3000

const workerBlob = new Blob(['(' + TranscodeWorker + ')()'], {type: "text/javascript"});
const transWorker = new Worker(window.URL.createObjectURL(workerBlob));

const getWebSocketUrl = () => {
    return new Promise((resolve) => {
        // @ts-ignore
        const date = new Date().toGMTString()
        const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`
        const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, API_SECRET)
        const signature = CryptoJS.enc.Base64.stringify(signatureSha)
        const authorizationOrigin = `api_key="${API_KEY}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
        const authorization = btoa(authorizationOrigin)
        resolve(`${url}?authorization=${authorization}&date=${date}&host=${host}`)
    })
}

export class IatRecognizer
{
    private status: RecognitionStatus;
    private audioData: any;
    private resultTextTemp: string;
    private resultText: string;
    private webSocket: WebSocket;
    private audioContext: AudioContext;
    private scriptProcessor: ScriptProcessorNode;
    private mediaSource: MediaStreamAudioSourceNode;
    private audioStream: MediaStream;
    private handlerInterval;

    public onRecognizerResult: (result: RecognitionResult) => void;
    public onRecognizerStop: () => void;
    public onRecognizerError: (error) => void;
    public onStatusChange: (oldStatus, status) => void;

    constructor() {
        this.status = RecognitionStatus.null
        // 记录音频数据
        this.audioData = []
        // 记录听写结果
        this.resultText = ''
        // wpgs下的听写结果需要中间状态辅助记录
        this.resultTextTemp = ''
        transWorker.onmessage = (event) => {
            this.audioData.push(...event.data)
        }
    }
    // 修改录音听写状态
    private setStatus(status: RecognitionStatus) {
        this.onStatusChange && this.status !== status && this.onStatusChange(this.status, status)
        this.status = status
    }
    // @ts-ignore
    private setResultText({ resultText, resultTextTemp, isLast } = {}) {
        const text = resultTextTemp || resultText || ''
        const previousText = this.resultText || this.resultTextTemp || ''
        if (this.onRecognizerResult && text.length !== 0 && text !== previousText) {
            this.onRecognizerResult({text, isLast});
        }
        resultText !== undefined && (this.resultText = resultText)
        resultTextTemp !== undefined && (this.resultTextTemp = resultTextTemp)
    }
    // 连接websocket
    private connectWebSocket() {
        return getWebSocketUrl().then((url: string) => {
            let iatWS
            if ('WebSocket' in window) {
                iatWS = new WebSocket(url)
            } else if ('MozWebSocket' in window) {
                // @ts-ignore
                iatWS = new MozWebSocket(url)
            } else {
                this.onRecognizerError && this.onRecognizerError(new Error('WebSocket not supported'))
                return
            }
            this.webSocket = iatWS
            this.setStatus(RecognitionStatus.initialized)
            iatWS.onopen = () => {
                this.setStatus(RecognitionStatus.processing)
                // 重新开始录音
                setTimeout(() => {
                    this.webSocketSend()
                }, 40)
            }
            iatWS.onmessage = e => {
                this.result(e.data)
            }
            iatWS.onerror = e => {
                this.recorderStop()
                this.onRecognizerError && this.onRecognizerError(e)
            }
            iatWS.onclose = () => {
                this.recorderStop()
            }
        })
    }
    // 初始化浏览器录音
    private recorderInit() {
        // @ts-ignore
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia

        // 创建音频环境
        try {
            // @ts-ignore
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
            this.audioContext.resume()
            if (!this.audioContext) {
                this.onRecognizerError && this.onRecognizerError(new Error('WebAudioApi not supported'))
                return
            }
        } catch (e) {
            if (!this.audioContext) {
                this.onRecognizerError && this.onRecognizerError(new Error('WebAudioApi not supported'))
                return
            }
        }

        // 获取浏览器录音权限
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({
                    audio: true,
                    video: false,
                })
                .then(stream => {
                    getMediaSuccess(stream)
                })
                .catch(e => {
                    getMediaFail(e)
                })
            // @ts-ignore
        } else if (navigator.getUserMedia) {
            // @ts-ignore
            navigator.getUserMedia(
                {
                    audio: true,
                    video: false,
                },
                stream => {
                    getMediaSuccess(stream)
                },
                function(e) {
                    getMediaFail(e)
                }
            )
        } else {
            if (navigator.userAgent.toLowerCase().match(/chrome/) && location.origin.indexOf('https://') < 0) {
                this.onRecognizerError && this.onRecognizerError(new Error('Cannot get audio due to security issues'))
            } else {
                this.onRecognizerError && this.onRecognizerError(new Error('Cannot get audio'))
            }
            this.audioContext && this.audioContext.close()
            return
        }
        // 获取浏览器录音权限成功的回调
        const getMediaSuccess = stream => {
            // 创建一个用于通过JavaScript直接处理音频
            this.audioStream = stream
            this.scriptProcessor = this.audioContext.createScriptProcessor(0, 1, 1)
            this.scriptProcessor.onaudioprocess = e => {
                // 去处理音频数据
                if (this.status === RecognitionStatus.processing) {
                    transWorker.postMessage(e.inputBuffer.getChannelData(0))
                }
            }
            // 创建一个新的MediaStreamAudioSourceNode 对象，使来自MediaStream的音频可以被播放和操作
            this.mediaSource = this.audioContext.createMediaStreamSource(stream)
            // 连接
            this.mediaSource.connect(this.scriptProcessor)
            this.scriptProcessor.connect(this.audioContext.destination)
            this.connectWebSocket()
        }

        const getMediaFail = (e) => {
            this.audioContext && this.audioContext.close()
            this.audioContext = undefined
            // 关闭websocket
            if (this.webSocket && this.webSocket.readyState === 1) {
                this.webSocket.close()
            }
            this.onRecognizerError && this.onRecognizerError(e);
        }
    }
    private recorderStart() {
        if (!this.audioContext) {
            this.recorderInit()
        } else {
            this.audioContext.resume()
            this.connectWebSocket()
        }
    }
    // 暂停录音
    private recorderStop() {
        // safari下suspend后再次resume录音内容将是空白，设置safari下不做suspend
        if (!(/Safari/.test(navigator.userAgent))) {// && !/Chrome/.test(navigator.userAgent))){
            this.audioContext && this.audioContext.suspend()
        }
        this.setStatus(RecognitionStatus.ended)
        this.onRecognizerStop()
    }
    // 处理音频数据
    // transAudioData(audioData) {
    //   audioData = transAudioData.transaction(audioData)
    //   this.audioData.push(...audioData)
    // }
    // 对处理后的音频数据进行base64编码，
    private static toBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return window.btoa(binary)
    }
    // 向webSocket发送数据
    private webSocketSend() {
        if (this.webSocket.readyState !== 1) {
            return
        }
        let audioData = this.audioData.splice(0, 1280)
        const params = {
            common: {
                app_id: APPID
            },
            business: {
                language, //小语种可在控制台--语音听写（流式）--方言/语种处添加试用
                domain: 'iat',
                accent, //中文方言可在控制台--语音听写（流式）--方言/语种处添加试用
                vad_eos: speechEndTimeout,
                dwa: 'wpgs', //为使该功能生效，需到控制台开通动态修正功能（该功能免费）
            },
            data: {
                status: 0,
                format: 'audio/L16;rate=16000',
                encoding: 'raw',
                audio: IatRecognizer.toBase64(audioData),
            },
        }
        this.webSocket.send(JSON.stringify(params))
        this.handlerInterval = setInterval(() => {
            // websocket未连接
            if (this.webSocket.readyState !== 1) {
                this.audioData = []
                clearInterval(this.handlerInterval)
                return
            }
            if (this.audioData.length === 0) {
                if (this.status === RecognitionStatus.ended) {
                    this.webSocket.send(
                        JSON.stringify({
                            data: {
                                status: 2,
                                format: 'audio/L16;rate=16000',
                                encoding: 'raw',
                                audio: '',
                            },
                        })
                    )
                    this.audioData = []
                    clearInterval(this.handlerInterval)
                }
                return false
            }
            audioData = this.audioData.splice(0, 1280)
            // 中间帧
            this.webSocket.send(
                JSON.stringify({
                    data: {
                        status: 1,
                        format: 'audio/L16;rate=16000',
                        encoding: 'raw',
                        audio: IatRecognizer.toBase64(audioData),
                    },
                })
            )
        }, 40)
    }
    private result(resultData) {
        // 识别结束
        const jsonData = JSON.parse(resultData)
        if (jsonData.data && jsonData.data.result) {
            const data = jsonData.data.result
            let str = ''
            const ws = data.ws
            for (let i = 0; i < ws.length; i++) {
                str = str + ws[i].cw[0].w
            }
            const isLast: boolean = data.ls;
            // 开启wpgs会有此字段(前提：在控制台开通动态修正功能)
            // 取值为 "apd"时表示该片结果是追加到前面的最终结果；取值为"rpl" 时表示替换前面的部分结果，替换范围为rg字段
            if (data.pgs) {
                if (data.pgs === 'apd') {
                    // 将resultTextTemp同步给resultText
                    // this.setResultText({
                    //     resultText: this.resultTextTemp,
                    //     isLast
                    // })
                    this.resultText = this.resultTextTemp
                }
                // 将结果存储在resultTextTemp中
                // @ts-ignore
                this.setResultText({
                    resultTextTemp: this.resultText + str,
                    isLast
                })
            } else {
                // @ts-ignore
                this.setResultText({
                    resultText: this.resultText + str,
                    isLast
                })
            }
        }
        if (jsonData.code === 0 && jsonData.data.status === 2) {
            this.webSocket.close()
        }
        if (jsonData.code !== 0) {
            this.webSocket.close()
            this.onRecognizerError && this.onRecognizerError(new Error('Engine failure, code: ' + jsonData.code))
        }
    }
    public start() {
        this.resultText = ''
        this.resultTextTemp = ''
        this.recorderStart()
    }
    public stop() {
        this.recorderStop()
        this.mediaSource && this.mediaSource.disconnect()
        this.scriptProcessor && this.scriptProcessor.disconnect()
        this.audioContext && this.audioContext.close()
        this.audioStream && this.audioStream.getTracks().forEach((track) => {
            track.stop()
        })
        this.mediaSource = null
        this.scriptProcessor = null
        this.audioContext = null
        this.audioStream = null
    }
}
