import * as bodyPix from '@tensorflow-models/body-pix';
// eslint-disable-next-line no-unused-vars
import * as tf from '@tensorflow/tfjs'

export class virtualBackground {
  canvas = null;
  bgSrc = null;
  config = null;
  backgroundBlurAmount = 10;
  edgeBlurAmount = 3;
  flipHorizontal = false
  net = null;
  context = null;

  constructor (canvas, modelConfig = undefined) {
    this.canvas = canvas;
    this.config = modelConfig;
    this.context = this.canvas.getContext('2d')

    if (modelConfig == undefined) {
      bodyPix.load().then((net) => {
        this.net = net;
      });
    } else {
      bodyPix.load(this.config).then((net) => {
        this.net = net;
      })
    }
  }

  setModelConfig (architecture = 'MobileNetV1',
    outputStride = 16,
    multiplier = 1,
    quantBytes = 2) {
    this.net = bodyPix.load({
      architecture,
      outputStride,
      multiplier,
      quantBytes
    });
  }

  /**
   * @param backgroundBlurAmount : the larger, the blurrier.range:[1,20]
   * @param edgeBlurAmount : the larger, the blurrier.range:[0,20]
   * @param flipHorizontal : boolean
   */
  setBlurConfig (backgroundBlurAmount, edgeBlurAmount, flipHorizontal) {
    this.backgroundBlurAmount = backgroundBlurAmount;
    this.edgeBlurAmount = edgeBlurAmount;
    this.flipHorizontal = flipHorizontal;
  }

  /**
   * @param frame
   * @returns {Promise<void>}
   * @attention call requestAnimationFrame after call this func
   */
  async blurBackground (frame) {
    frame.width = this.canvas.width;
    frame.height = this.canvas.height;
    const segmentation = await this.net.segmentPerson(frame)

    bodyPix.drawBokehEffect(
      this.canvas, frame, segmentation, this.backgroundBlurAmount,
      this.edgeBlurAmount, this.flipHorizontal
    );
  }

  /**
   * @param {*} backgoundImg : a url
   */
  setVBConfig (backgoundImg) {
    this.backgoundImg = backgoundImg
  }

  /**
   * @param frame
   * @returns {Promise<void>}
   * @attention call setVBConfig before call this ,call requestAnimationFrame after call this
   */
  async replaceBackground (frame) {
    frame.width = this.canvas.width;
    frame.height = this.canvas.height;
    const segmentation = await this.net.segmentPerson(frame);

    const foreColor = {r: 0, g: 0, b: 0, a: 0}
    const backColor = {r: 0, g: 0, b: 0, a : 255}

    let maskImg = await bodyPix.toMask(segmentation, foreColor, backColor)

    this.context.putImageData(maskImg, 0, 0)
    this.context.globalCompositeOperation = 'source-in'
    this.context.drawImage(this.backgoundImg, 0, 0, this.canvas.width, this.canvas.height)
    this.context.globalCompositeOperation = 'destination-over'
    this.context.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height)
    this.context.globalCompositeOperation = 'source-over'
  }
}
