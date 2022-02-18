import {EventEmitter} from 'events';
import {types as MTypes} from 'mediasoup';

export interface Peer{

    //region Getter

    /**
     * @function getXXX
     * @param XXXID
     * @return XXX : XXX if success, null if failed
     */

    getTransport (transportID : string);

    getProducer (producerID : string);

    getConsumer (consumerID : string);

    getDataProducer (producerID : string);

    getDataConsumer (consumerID : string);

    getAllProducer ();

    getAllDataProducer ();

    getAllAudioProducer ();

    getAllConsumer () ;

    getAllDataConsumer ();

    /**
     * @return peerInfo:
     * {
     *          id,
     *          roonID,
     *          displayName,
     *          joined,
     *          device,
     *          rtpCapabilites
     *          }
     *
     */
    getPeerInfo ();

    /**
     * @return consumerTransport : undefined if failed
     */
    getConsumerTransport();

    //endregion

    //region setter

    /**
     * @function setXXX
     * @param XXXID
     * @param XXX
     * @return void : update if exist, add a new one if not
     */

    setTransport (transportID : string, transport : MTypes.WebRtcTransport);

    setProducer (producerID : string, producer : MTypes.Producer);

    setConsumer (consumerID : string, consumer : MTypes.Consumer);

    setDataProducer (producerID : string, dataProducer : MTypes.DataProducer);

    setDataConsumer (consumerID: string, dataConsumer : MTypes.DataConsumer);

    /**
     * @param displayName
     * @param avatar
     * @param joined
     * @param closed
     * @param device
     * @param rtpCapabilities
     * @param sctpCapabilities
     */
    setPeerInfo ({
                     displayName,
                     avatar,
                     joined,
                     closed,
                     device,
                     rtpCapabilities,
                     sctpCapabilities
    });

    //endregion

    //region deleter

    /**
     * @function deleteXXX
     * @param XXXID
     * @return boolean : true if success, false if failed
     */

    deleteTransport (transportID : string);

    deleteProducer (producerID : string);

    deleteConsumer (consumerID : string);

    deleteDataProducer (producerID : string);

    deleteDataConsumer (consumerID : string);

    //endregion

    close();
}
