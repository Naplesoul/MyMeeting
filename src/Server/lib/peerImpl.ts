import {EventEmitter} from 'events';
import {types as MTypes} from 'mediasoup';
import {Peer} from "./peer";
import * as socketio from 'socket.io';

export class PeerImpl extends EventEmitter implements Peer{
    public readonly id : number;
    public socket : socketio.Socket;
    displayName : string;
    avatar : string;
    private joined : boolean = false;
    private closed : boolean = false;
    device : object;
    private rtpCapabilities : MTypes.RtpCapabilities;
    private sctpCapabilities : MTypes.SctpCapabilities;
    private transports = new Map<string, MTypes.WebRtcTransport>();
    public producers = new Map<string, MTypes.Producer>();
    private consumers = new Map<string, MTypes.Consumer>();
    private dataProducers = new Map<string, MTypes.DataProducer>();
    private dataConsumers = new Map<string, MTypes.DataConsumer>();

    constructor(id: number, socket) {
        super();
        this.id = id;
        this.socket = socket;
    }


    // region Getter, Setter, Deleter

    getPeerInfo() {
        return {
            id : this.id,
            displayName : this.displayName,
            avatar : this.avatar,
            joined : this.joined,
            closed : this.closed,
            device : this.device,
            rtpCapabilities : this.rtpCapabilities,
            sctpCapabilities : this.sctpCapabilities
        };
    }


    getTransport (transportID:string) {
        if (this.transports.has(transportID)) {
            return this.transports.get(transportID);
        }
        return null;
    }

    getProducer (producerID:string) {
        if (this.producers.has(producerID)) {
            return this.producers.get(producerID);
        }
        return null;
    }

    getConsumer(consumerID: string) {
        if (this.consumers.has(consumerID)) {
            return this.consumers.get(consumerID);
        }
        return null;
    }

    getDataProducer(producerID: string) {
        if (this.dataProducers.has(producerID)){
            return this.dataProducers.get(producerID);
        }
        return null;
    }

    getDataConsumer(consumerID: string) {
        if (this.dataConsumers.has(consumerID)){
            return this.dataConsumers.get(consumerID);
        }
        return null;
    }

    getConsumerTransport() {
        return Array.from(this.transports.values())
            .find((t) => t.appData.transportType === 'consumer')
    }

    getAllProducer() {
        return Array.from(this.producers.values());
    }

    getAllDataProducer() {
        return Array.from(this.dataProducers.values());
    }

    getAllAudioProducer() {
        return Array.from(this.producers.values())
            .filter((p) => p.kind === 'audio');
    }

    getAllConsumer () {
        return Array.from(this.consumers.values())
    }

    getAllDataConsumer () {
        return Array.from(this.dataConsumers.values())
    }

    setTransport(transportID: string, transport: MTypes.WebRtcTransport) {
        this.transports.set(transportID, transport);
    }

    setProducer(producerID: string, producer: MTypes.Producer) {
        this.producers.set(producerID, producer);
    }

    setConsumer(consumerID: string, consumer: MTypes.Consumer) {
        this.consumers.set(consumerID, consumer);
    }

    setDataProducer(producerID: string, dataProducer: MTypes.DataProducer) {
        this.dataProducers.set(producerID, dataProducer);
    }

    setDataConsumer(consumerID: string, dataConsumer: MTypes.DataConsumer) {
        this.dataConsumers.set(consumerID, dataConsumer);
    }

    setPeerInfo({
                    displayName, avatar, joined, closed, device, rtpCapabilities, sctpCapabilities
    }: { displayName: any; avatar : any; joined: any; closed : any; device: any; rtpCapabilities: any; sctpCapabilities : any}) {
        if (displayName != undefined)
            this.displayName = displayName;
        if (avatar != undefined)
            this.avatar = avatar;
        if (joined != undefined)
            this.joined = joined
        if (closed != undefined)
            this.closed = closed
        if (device != undefined)
            this.device = device
        if (rtpCapabilities != undefined)
            this.rtpCapabilities = rtpCapabilities
        if (sctpCapabilities != undefined)
            this.sctpCapabilities = sctpCapabilities
    }

    deleteTransport (transportID:string) {
        return this.transports.delete(transportID);
    }

    deleteProducer (producerID:string) {
        return this.producers.delete(producerID);
    }

    deleteConsumer(consumerID: string) {
        return this.consumers.delete(consumerID);
    }

    deleteDataProducer(producerID: string) {
        return this.dataProducers.delete(producerID);

    }

    deleteDataConsumer(consumerID: string) {
        return this.dataConsumers.delete(consumerID);
    }

    // endregion

    close() {
        this.closed = true;

        this.producers.forEach((producer) => {
            producer.close();
        })
        this.consumers.forEach((consumer) => {
            consumer.close();
        })
        this.dataProducers.forEach((producer) => {
            producer.close();
        })
        this.dataConsumers.forEach((consumer) => {
            consumer.close();
        })
        this.transports.forEach((transport) => {
            transport.close();
        })

        this.transports.clear();
        this.producers.clear();
        this.consumers.clear();
        this.dataProducers.clear();
        this.dataConsumers.clear();

        this.emit('close');
    }
}
