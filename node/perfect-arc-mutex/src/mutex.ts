import type {
    InnerState,
    MessageQueue,
    ReceiverMessage,
    SenderMessage,
    Sender,
    Receiver,
    MutexKey,
} from './type.js';

export class ArcMutex<in out T> {
    #key: string;
    #worker: SharedWorker;
    #messageQueue: MessageQueue;
    #state: InnerState | undefined;

    constructor(key: MutexKey<T>) {
        this.#key = key;
        this.#messageQueue = new Map();
        this.#worker = new SharedWorker(new URL("./sharedWorker.js", import.meta.url));
        this.#setupWorker();
    }

    #setupWorker() {
        this.#worker.port.addEventListener('message', (e: MessageEvent<ReceiverMessage>) => {
            const resolve = this.#messageQueue.get(e.data.id);
            if (!resolve) throw new Error("An unknown message was received.");
            this.#messageQueue.delete(e.data.id);
            resolve(e.data);
        });
        this.#worker.port.addEventListener("messageerror", (e) => {
            console.warn(e);
        })
        this.#worker.port.start();
    }

    #generateID() {
        return crypto.randomUUID();
    }

    async #message<T extends SenderMessage['type']>(type: T, msg: Sender<T>): Promise<Receiver<T>>;
    async #message(type: string, msg: Omit<SenderMessage, "type" | "id" | "key">): Promise<ReceiverMessage> {
        const { promise, resolve } = Promise.withResolvers<ReceiverMessage>();
        const id = this.#generateID();
        this.#messageQueue.set(id, resolve);
        this.#worker.port.postMessage({
            ...msg,
            type,
            key: this.#key,
            id,
        });
        return promise;
    }

    async connect(): Promise<this> {
        if (this.#state) throw "already connected";
        const result = await this.#message("connect", {});
        if (result.status === "failed") throw result.reason;
        this.#state = result.state;
        return this;
    }

    get id() {
        if (!this.#state) throw new Error("Cannot be accessed until connection is established.");
        return this.#state.cid;
    }
}