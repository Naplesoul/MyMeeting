import global from "./global";
import {BackgroundProcessType} from "./Types";

export class MediaStreamFactory
{
    private currentBackgroundOption: BackgroundProcessType = null;
    private currentBeautifyState: boolean = null;
    private currentDisplaySourceId = null;

    private cameraTrack: MediaStreamTrack = null;
    private processedCameraTrack: MediaStreamTrack = null;
    private microphoneTrack: MediaStreamTrack = null;
    private screenVideoTrack: MediaStreamTrack = null;
    private screenAudioTrack: MediaStreamTrack = null;
    constructor()
    {
        // @ts-ignore
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
            // @ts-ignore
            navigator.mozGetUserMedia || navigator.msGetUserMedia;
        // @ts-ignore
        if (!navigator.getUserMedia) {
            console.log('Browser DOES NOT support!')
        }
    }

    public async getCameraTrack()
    {
        if (this.cameraTrack && this.cameraTrack.readyState === 'live') {
            return this.cameraTrack;
        }
        try {
            const constraint = {
                video : global.videoConstraint,
                audio : false,
            };
            const videoStream = await navigator.mediaDevices.getUserMedia(constraint);
            const videoTracks = videoStream.getVideoTracks();
            const tracksCount = videoTracks.length;
            if (tracksCount <= 0) {
                console.error('There is no video source that meets the constraint');
                return Promise.reject('There is no video source that meets the constraint');
            }
            this.cameraTrack = videoTracks[0];
            for (let i = 1; i < tracksCount; ++i) {
                videoTracks[i].stop();
            }
            return this.cameraTrack;
        } catch (err) {
            console.error(err.message);
            return Promise.reject(err.message);
        }
    }

    public async getMicrophoneTrack()
    {
        if (this.microphoneTrack && this.microphoneTrack.readyState === 'live') {
            return this.microphoneTrack;
        }
        try {
            const constraint = {
                video : false,
                audio : {autoGainControl: true, echoCancellation: true, noiseSuppression: true},
            };
            const microphoneStream = await navigator.mediaDevices.getUserMedia(constraint);
            const audioTracks = microphoneStream.getAudioTracks();
            const tracksCount = audioTracks.length;
            if (tracksCount <= 0) {
                console.error('There is no audio source that meets the constraint');
                return Promise.reject('There is no audio source that meets the constraint');
            }
            this.microphoneTrack = audioTracks[0];
            for (let i = 1; i < tracksCount; ++i) {
                audioTracks[i].stop();
            }
            return this.microphoneTrack;
        } catch (err) {
            console.error(err.message);
            return Promise.reject(err.message);
        }
    }

    public async getScreenTracks(enableVideo: boolean, enableAudio: boolean, displaySourceId = null)
    {
        let needVideo = enableVideo;
        if (this.screenVideoTrack && this.screenVideoTrack.readyState === 'live' && enableVideo
            && this.currentDisplaySourceId && this.currentDisplaySourceId === displaySourceId) {
            needVideo = false;
        } else {
            this.stopScreenVideo();
        }

        let needAudio = enableAudio;
        if (this.screenAudioTrack && this.screenAudioTrack.readyState === 'live' && enableAudio
            && this.currentDisplaySourceId && this.currentDisplaySourceId === displaySourceId) {
            needAudio = false;
        } else {
            this.stopScreenVideo();
        }

        if (!needVideo && !needAudio) {
            return ({
                screenVideoTrack: this.screenVideoTrack,
                screenAudioTrack: this.screenAudioTrack,
            });
        }

        this.currentDisplaySourceId = displaySourceId;

        try {
            const constraints = displaySourceId ? {
                video: needVideo ? {mandatory: {chromeMediaSource: 'desktop', chromeMediaSourceId: displaySourceId}} : false,
                audio: needAudio ? {mandatory: {chromeMediaSource: 'desktop', chromeMediaSourceId: displaySourceId}} : false,
            } : {
                video: needVideo ? {mandatory: {chromeMediaSource: 'desktop'}} : false,
                audio: needAudio ? {mandatory: {chromeMediaSource: 'desktop'}} : false,
            }

            // @ts-ignore
            const screenStream = await navigator.mediaDevices.getUserMedia(constraints);

            if (needVideo) {
                const videoTracks = screenStream.getVideoTracks();
                const tracksCount = videoTracks.length;
                if (tracksCount <= 0) {
                    console.error('There is no screen video source that meets the constraint');
                    return Promise.reject('There is no screen video source that meets the constraint');
                }
                this.screenVideoTrack = videoTracks[0];
                for (let i = 1; i < tracksCount; ++i) {
                    videoTracks[i].stop();
                }
            }

            if (needAudio) {
                const audioTracks = screenStream.getAudioTracks();
                const tracksCount = audioTracks.length;
                if (tracksCount <= 0) {
                    console.error('There is no screen audio source that meets the constraint');
                    return Promise.reject('There is no screen audio source that meets the constraint');
                }
                this.screenAudioTrack = audioTracks[0];
                for (let i = 1; i < tracksCount; ++i) {
                    audioTracks[i].stop();
                }
            }

            return ({
                screenVideoTrack: this.screenVideoTrack,
                screenAudioTrack: this.screenAudioTrack,
            });

        } catch (err) {
            console.error(err.message);
            return Promise.reject(err.message);
        }
    }

    public stopCamera()
    {
        this.cameraTrack && this.cameraTrack.stop();
        this.cameraTrack = null;
    }

    public stopMicrophone()
    {
        this.microphoneTrack && this.microphoneTrack.stop();
        this.microphoneTrack = null;
    }

    public stopScreenVideo()
    {
        this.screenVideoTrack && this.screenVideoTrack.stop();
        this.screenVideoTrack = null;
    }

    public stopScreenAudio()
    {
        this.screenAudioTrack && this.screenAudioTrack.stop();
        this.screenAudioTrack = null;
    }

    public stopScreen()
    {
        this.stopScreenVideo();
        this.stopScreenAudio();
        this.currentDisplaySourceId = null;
    }

    public stopAll()
    {
        this.stopCamera();
        this.stopMicrophone();
        this.stopScreen();
    }
}
