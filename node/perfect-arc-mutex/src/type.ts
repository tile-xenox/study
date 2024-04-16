export type SenderMessage = {
    id: string,
    key: string,
} & ({
    type: "connect",
} | {
    type: "init",
    cid: string,
    value: unknown,
} | {
    type: "provide",
    cid: string,
    value: unknown,
} | {
    type: "inject",
    cid: string,
});

export type InnerState = {
    cid: string,
    i32: Int32Array,
};

export type MessageQueue = Map<string, (msg: ReceiverMessage) => void>;

export type ReceiverMessage = {
    id: string,
} & ({
    type: "connect",
    status: "failed",
    reason: string,
} | {
    type: "connect",
    status: "success",
    state: InnerState,
} | {
    type: "init",
    result: boolean,
} | {
    type: "provide",
    result: boolean,
} | {
    type: "inject",
    value: unknown,
});

type DistributeOmit<T, K extends string> = T extends unknown ? Omit<T, K> : never;
export type Sender<T extends string> = DistributeOmit<Extract<SenderMessage, { type: T }>, "type" | "id" | "key">;
export type Receiver<T extends string> = DistributeOmit<Extract<ReceiverMessage, { type: T }>, "type">;

export type WorkerStore = {
    i32: Int32Array,
    value: unknown,
    cMap: Map<string, MessagePort>
};

export type MutexKey<T> = string & Record<never, T>;
