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
    #messageQueue: MessageQueue = new Map();
    #state: InnerState | undefined;
    #poisoned: boolean = false;
    #poisonedMessage = "This mutex is poisoned";
    #unconnectedMessage = "Cannot be accessed until connection is established";

    constructor(key: MutexKey<T>) {
        this.#key = key;
        this.#worker = new SharedWorker(new URL("sharedWorker.js", import.meta.url));
        this.#setupWorker();
    }

    #poisoning() {
        this.#poisoned = true;
        for (const [, { reject }] of this.#messageQueue) {
            reject(this.#poisonedMessage);
        }
        this.#messageQueue.clear();
    }

    #setupWorker() {
        this.#worker.port.addEventListener('message', (e: MessageEvent<ReceiverMessage>) => {
            console.log(`receive ${e.data.type}`);
            const { resolve } = this.#messageQueue.get(e.data.id) ?? {};
            if (!resolve) {
                this.#poisoning();
                return;
            }
            this.#messageQueue.delete(e.data.id);
            resolve(e.data);
        });
        this.#worker.port.addEventListener("messageerror", this.#poisoning);
        this.#worker.addEventListener("error", this.#poisoning);
        this.#worker.port.start();
    }

    #generateID() {
        return crypto.randomUUID();
    }

    #message<T extends SenderMessage['type']>(type: T, msg: Sender<T>): Promise<Receiver<T>>;
    #message(type: string, msg: Omit<SenderMessage, "type" | "id" | "key">): Promise<ReceiverMessage> {
        console.log(type);
        const { promise, resolve, reject } = Promise.withResolvers<ReceiverMessage>();
        if (this.#poisoned) {
            reject(this.#poisonedMessage);
            return promise;
        }
        const id = this.#generateID();
        this.#messageQueue.set(id, { resolve, reject });
        this.#worker.port.postMessage({
            ...msg,
            type,
            key: this.#key,
            id,
        });
        return promise;
    }

    async connect(): Promise<this> {
        if (this.#poisoned) throw this.#poisonedMessage;
        if (!crossOriginIsolated) throw "crossOriginIsolated was false";
        if (this.#state) throw "already connected";
        const res = await this.#message("connect", {});
        if (!res.needSetup) {
            const { cid, i32 } = res;
            this.#state = { cid, i32 };
            return this;
        }
        const { cid } = res;
        const sab = new SharedArrayBuffer(16);
        const i32 = new Int32Array(sab);
        const setupRes = await this.#message("setup", { cid, i32 });
        if (setupRes.result) {
            this.#state = { cid, i32 };
            return this;
        }
        this.#state = { cid, i32: setupRes.i32 };
        return this;
    }

    get id() {
        if (!this.#state) throw new Error(this.#unconnectedMessage);
        return this.#state.cid;
    }
}