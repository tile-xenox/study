/// <reference lib="webworker" />
import type {
    SenderMessage,
    ReceiverMessage,
    WorkerStore,
    Receiver,
} from "./type.js";

const globalStore = new Map<string, WorkerStore>();

const never = (n: never): never => {
    throw new Error(`${n} must be never`);
};

const post = <T extends ReceiverMessage['type']>(
    port: MessagePort,
    type: T,
    msg: Receiver<T>,
) => {
    port.postMessage({ ...msg, type });
}

(self as unknown as SharedWorkerGlobalScope).addEventListener("connect", (event) => {
    console.log("connected");
    const port = event.ports[0];
    if (!port) return;
    const cid = crypto.randomUUID();
    port.addEventListener("message", (e: MessageEvent<SenderMessage>) => {
        const { data } = e;
        switch (data.type) {
            case "connect": {
                (() => {
                    const store = globalStore.get(data.key);
                    if (store) {
                        store.cMap.set(cid, port);
                        post(port, "connect", {
                            id: data.id,
                            status: "success",
                            state: { cid, i32: store.i32 },
                        });
                        return;
                    }
                    if (!crossOriginIsolated) {
                        post(port, "connect", {
                            id: data.id,
                            status: "failed",
                            reason: "crossOriginIsolated was false",
                        });
                        return;
                    }
                    const sab = new SharedArrayBuffer(16);
                    const i32 = new Int32Array(sab);
                    globalStore.set(data.key, {
                        i32,
                        value: undefined,
                        cMap: new Map([[cid, port]])
                    });
                    post(port, "connect", {
                        id: data.id,
                        status: "success",
                        state: { cid, i32 },
                    });
                })();
                break;
            }
            case "init": {
                break;
            }
            case "inject": {
                break;
            }
            case "provide": {
                break;
            }
            default: {
                never(data);
                break;
            }
        }
    });
    port.start();
})
