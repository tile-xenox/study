export type SenderMessage = {
    id: string,
    key: string,
} & ({
    type: "connect",
} | {
    type: "setup",
    cid: string,
    i32: Int32Array,
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

export type MessageQueue = Map<string, {
    resolve: (msg: ReceiverMessage) => void,
    reject: (reason?: unknown) => void,
}>;

export type ReceiverMessage = { id: string } & (
(
    {
        type: "connect",
        cid: string,
    } & ({
        needSetup: false,
        i32: Int32Array,
    } | {
        needSetup: true,
    })
) | (
    {
        type: "setup",
    } & ({
        result: true,
    } | {
        result: false,
        i32: Int32Array,
    })
) | {
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
