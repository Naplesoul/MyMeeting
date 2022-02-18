// import '@tensorflow/tfjs-backend-webgl';
// eslint-disable-next-line no-unused-vars
import '@tensorflow/tfjs-backend-webgl';
import * as bodyPix from '@tensorflow-models/body-pix';

let net;

const foreColor = {r: 0, g: 0, b: 0, a: 0};
const backColor = {r: 0, g: 0, b: 0, a : 255};

const loadModel = async () => {
    net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2
    });
    console.log('[Video Processor] Model loaded')
}

export const getMask = async (frame) => {
    // const segmentation =  await net.segmentMultiPerson(frame, {
    //     internalResolution: 'high',
    //     segmentationThreshold: 0.7,
    //     maxDetections: 5,
    //     scoreThreshold: 0.3,
    //     nmsRadius: 20,
    //     numKeypointForMatching: 17,
    //     refineSteps: 10
    // });

    const segmentation =  await net.segmentPerson(frame, {
        internalResolution: 'full',
        segmentationThreshold: 0.7,
        scoreThreshold: 0.3,
        nmsRadius: 20,
    });

    return bodyPix.toMask(segmentation, foreColor, backColor);
}

export const segment = async (frame) => {
    return await net.segmentPerson(frame, {
        internalResolution: 'full',
        segmentationThreshold: 0.7,
        scoreThreshold: 0.3,
        nmsRadius: 20,
    });
}

loadModel();
