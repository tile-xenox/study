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
    const port = event.ports[0];
    if (!port) return;
    const cid = crypto.randomUUID();
    port.addEventListener("messageerror", (e) => {
        console.error(e);
    });
    port.addEventListener("message", (e: MessageEvent<SenderMessage>) => {
        const { data } = e;
        switch (data.type) {
            case "connect": {
                console.log("connect");
                (() => {
                    const store = globalStore.get(data.key);
                    if (store) {
                        store.cMap.set(cid, port);
                        post(port, "connect", {
                            id: data.id,
                            needSetup: false,
                            cid,
                            i32: store.i32,
                        });
                        return;
                    }
                    post(port, "connect", {
                        id: data.id,
                        needSetup: true,
                        cid,
                    });
                })();
                break;
            }
            case "setup": {
                console.log("setup");
                (() => {
                    const store = globalStore.get(data.key);
                    if (store) {
                        store.cMap.set(cid, port);
                        post(port, "setup", { 
                            id: data.id,
                            result: false,
                            i32: store.i32,
                        });
                        return;
                    }
                    globalStore.set(data.key, {
                        i32: data.i32,
                        value: undefined,
                        cMap: new Map([[cid, port]]),
                    });
                    post(port, "setup", {
                        id: data.id,
                        result: true,
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
