import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs-backend-webgl';
// @ts-ignore
import MyWorker from 'comlink-loader!./media/BodyPixWorker';
import {BackgroundProcessType} from "@/utils/Types";
// @ts-ignore
import bg1 from "../../public/bg_1.jpg";

const defaultWidth = 640;
const defaultHeight = 360;
const maskBlurAmount = 3;
const backgroundBlurAmount = 3;
const edgeBlurAmount = 3;
const flipHorizontal = false;
const defaultImageSrc = bg1;
const bodyPixWorker = new MyWorker();

export class VideoProcessor
{
    private readonly width: number = null;
    private readonly height: number = null;
    private working: boolean = null;
    private readonly backgroundImage: HTMLImageElement = null;
    private readonly transparentBackground: HTMLCanvasElement = null;
    private readonly video: HTMLVideoElement = null;
    private inputStream: MediaStream = null;
    private readonly inputCanvas: HTMLCanvasElement = null;
    private readonly outputCanvas: HTMLCanvasElement = null;
    private inputCtx: CanvasRenderingContext2D = null;
    private outputCtx: CanvasRenderingContext2D = null;
    private transparentCtx: CanvasRenderingContext2D = null;

    constructor()
    {
        this.width = defaultWidth;
        this.height = defaultHeight;
        this.working = false;
        this.backgroundImage = new Image();
        this.backgroundImage.src = defaultImageSrc;

        this.video = document.createElement('video');
        this.video.autoplay = true;
        this.inputCanvas = document.createElement('canvas');
        this.outputCanvas = document.createElement('canvas');
        this.transparentBackground = document.createElement('canvas');
        this.inputCtx = this.inputCanvas.getContext('2d');
        this.outputCtx = this.outputCanvas.getContext('2d');
        this.transparentCtx = this.transparentBackground.getContext('2d');
        this.inputCanvas.width = this.outputCanvas.width = this.video.width = this.backgroundImage.width = this.transparentBackground.width = this.width;
        this.inputCanvas.height = this.outputCanvas.height = this.video.height = this.backgroundImage.height = this.transparentBackground.height = this.height;

        this.transparentCtx.fillStyle = '#00000000';
        this.transparentCtx.fillRect(0, 0, this.width, this.height);
    }

    public setBackground(imageURL: string)
    {
        this.backgroundImage.src = imageURL;
    }

    public process(mediaStream: MediaStream, backgroundOption: BackgroundProcessType, enableBeautify: boolean)
    {
        this.inputStream = mediaStream;
        this.video.srcObject = mediaStream;
        this.video.onloadeddata = () => {
            this.start(backgroundOption, enableBeautify);
        };
        // @ts-ignore
        return this.outputCanvas.captureStream();
    }

    private start(backgroundOption: BackgroundProcessType, enableBeautify: boolean)
    {
        this.working = true;
        switch (backgroundOption) {
            case BackgroundProcessType.blur:
                this.blurBackground().catch((err) => {console.error(err);});
                break;
            case BackgroundProcessType.virtual:
                this.replaceBackground().catch((err) => {console.error(err);});
                break;
        }
    }

    public stop()
    {
        if (this.working) {
            const tracks = this.inputStream.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
            this.working = false;
        }
    }

    public getWorkingState()
    {
        return this.working;
    }

    private replaceBackground = async () => {
        this.inputCtx.drawImage(this.video, 0, 0, this.width, this.height);
        const frame = this.inputCtx.getImageData(0, 0, this.width, this.height);
        const mask = await bodyPixWorker.getMask(frame);

        // const segmentation =  await net.segmentMultiPerson(this.inputCanvas, {
        //     internalResolution: 'high',
        //     segmentationThreshold: 0.7,
        //     maxDetections: 5,
        //     scoreThreshold: 0.3,
        //     nmsRadius: 20,
        //     numKeypointForMatching: 17,
        //     refineSteps: 10
        // });
        //
        // const mask = bodyPix.toMask(segmentation, foreColor, backColor);

        bodyPix.drawMask(this.outputCanvas, this.transparentBackground, mask, 1, maskBlurAmount, flipHorizontal);
        // this.outputCtx.putImageData(mask, 0, 0)
        this.outputCtx.globalCompositeOperation = 'source-in';
        this.outputCtx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
        this.outputCtx.globalCompositeOperation = 'destination-over';
        this.outputCtx.drawImage(this.inputCanvas, 0, 0, this.width, this.height);
        this.outputCtx.globalCompositeOperation = 'source-over';
        if (this.working) {
            requestAnimationFrame(this.replaceBackground);
        }
    }

    private blurBackground = async () => {
        this.inputCtx.drawImage(this.video, 0, 0, this.width, this.height);
        const frame = this.inputCtx.getImageData(0, 0, this.width, this.height);
        const segmentation = await bodyPixWorker.segment(frame);
        bodyPix.drawBokehEffect(this.outputCanvas, this.inputCanvas, segmentation, backgroundBlurAmount, edgeBlurAmount, flipHorizontal);
        if (this.working) {
            requestAnimationFrame(this.blurBackground);
        }
    }
}
