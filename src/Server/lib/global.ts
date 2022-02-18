import {Socket} from "socket.io";

export enum RequestMethod {

    /**
     * @ev request
     * @body none
     * @response rtpCapabilites
     */
    getRouterRtpCapabilities =  'getRouterRtpCapabilities' ,

    /**
     * @ev request
     * @body {
     *     displayName,
     *     joined,
     *     device,
     *     rtpCapabilities
     * }
     * @response peerInfos : information of joined peers
     */
    join = 'join',

    /**
     * @ev request
     * @body {
     *     transportType : 'consumer' or 'producer'
     * }
     * @response {
     *     id
     *     iceParameters
     *     iceCandidates
     *     dtlsParameters
     *     sctpParameters
     * }
     */
    createTransport = 'createTransport',

    /**
     * @ev request
     * @body {
     *     transportId
     *     dtlsParameters
     * }
     * @response none
     */
    connectWebRtcTransport = 'connectTransport',

    /**
     * @ev request
     * @body {
     *     transportId
     *     kind
     *     rtpParameters
     *     appData : {}
     * }
     * @response producerId
     */
    produce = 'produce',

    produceData = 'produceData',
    closeProducer = 'closeProducer',
    pauseProducer = 'pauseProducer',
    resumeProducer = 'resumeProducer',
    pauseConsumer = 'pauseConsumer',
    resumeConsumer = 'resumeConsumer',
    sendText = 'sendText',
    closeRoom = 'closeRoom',
    kick = 'kick',
    mute = 'mute',
    transferHost = 'transferHost',
    restartIce = 'restartIce',
    sendFile = 'sendFile',
    getStat = 'getStat',
}

export enum NotifyMethod {
    sendSpeechText = 'sendSpeechText'
}

let log4js = require('log4js')
log4js.configure({
    appenders:{
        cheese : {
            type : "dateFile",
            filename : './uploads/logs/cheese',
            alwaysIncludePattern: true,
            pattern : '[yyyy-MM-dd].log',
            category : 'default',
            maxLogSize: 11024
        }
    },
    categories : {
        default: { appenders: [ "cheese"], level: "INFO" }
    }
})
export let logger = require('log4js').getLogger();

logger.level = "debug";

export function _timeoutCallback(callback) {
    let called = false;

    const interval = setTimeout(() => {
            if (called) {
                return;
            }

            called = true;
            callback(new Error('Request timeout.'));
        },
        10000
    );

    return (...args) => {
        if (called) {
            return;
        }

        called = true;
        clearTimeout(interval);

        callback(...args);
    };
}

export function _request(socket : Socket, method : string, data = {}) {
    return new Promise((resolve, reject) => {
        socket.emit(
            'request',
            {method, data},
            this._timeoutCallback((err, response) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(response);
                }
            })
        )
    })
}

export function _notify(socket : Socket, method : string, data = {}, broadcast = false, roomId = undefined) {
    if (broadcast) {
        socket.broadcast.to(roomId).emit(
            'notify', {method, data}
        );
    } else
        socket.emit('notify', {method, data});
}
