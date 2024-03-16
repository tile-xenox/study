type LtMap = {
    "0": never,
    "1": "0",
    "2": "0" | "1",
    "3": "0" | "1" | "2",
    "4": "0" | "1" | "2" | "3",
    "5": "0" | "1" | "2" | "3" | "4",
    "6": "0" | "1" | "2" | "3" | "4" | "5",
    "7": "0" | "1" | "2" | "3" | "4" | "5" | "6",
    "8": "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7",
    "9": "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8",
}

type Msg = {
    lt: "less than",
    gt: "grater than",
    eq: "equal",
}

type Lt<N extends boolean = false> = N extends true ? Msg["gt"] : Msg["lt"]
type Gt<N extends boolean = false> = N extends true ? Msg["lt"] : Msg["gt"]
type Eq = Msg["eq"]

type Sym = 
    | " " | "!" | "\"" | "#" | "$"
    | "%" | "&" | "'" | "(" | ")"
    | "*" | "+" | "," | "-" | "."
    | "/" | ":" | ";" | "<" | "="
    | ">" | "?" | "@" | "[" | "\\"
    | "]" | "^" | "_" | "`" | "{"
    | "|" | "}" | "~"

type IntWeight = {
    "0": ["0"], "1": ["1"], "2": ["2"], "3": ["3"], "4": ["4"],
    "5": ["5"], "6": ["6"], "7": ["7"], "8": ["8"], "9": ["9"],
    a: [], b: ["6"], c: [], d: ["9"], e: ["2"],
    f: ["5"], g: ["8"], h: [], i: ["1"], j: ["4"],
    k: ["1", "6"], l: ["1"], m: ["1", "2"], n: ["7"], o: ["0", "0"],
    p: ["3"], q: ["9"], r: ["7"], s: ["8"], t: ["1", "0"],
    u: ["0"], v: ["5"], w: ["5", "5"], x: ["0", "1"], y: [],
    z: ["2"]
}

type DecWeight = {
    // "0": ["0"], "1": ["1"], "2": ["2"], "3": ["3"], "4": ["4"],
    // "5": ["5"], "6": ["6"], "7": ["7"], "8": ["8"], "9": ["9"],
    A: ["2"], B: [], C: ["0", "1"], D: ["5", "5"], E: ["5"],
    F: ["0"], G: ["1", "0"], H: ["8"], I: ["7"], J: ["9"],
    K: ["3"], L: ["0", "0"], M: ["7"], N: ["1", "2"], O: ["1"],
    P: ["1", "6"], Q: ["4"], R: ["1"], S: [], T: ["8"],
    U: ["5"], V: ["2"], W: ["9"], X: [], Y: ["6"],
    Z: []
}

type SecretN<S> = S extends `${string}${Sym}${string}` ? true : false

type SecretI<S> = S extends `${infer F}${infer R}`
    ? F extends keyof IntWeight
        ? [...IntWeight[F], ...SecretI<R>]
        : SecretI<R>
    : []

type FixI<T> = T extends [infer F, ...infer R]
    ? F extends "0"
        ? FixI<R>
        : T
    : ["0"]

type SecretD<S> = S extends `${infer F}${infer R}`
    ? F extends keyof DecWeight
        ? [...DecWeight[F], ...SecretD<R>]
        : SecretD<R>
    : []

type FixD<T> = T extends [...infer R, infer F]
    ? F extends "0"
        ? FixD<R>
        : T
    : []

type GenerateSecret<S extends string> = {
    n: SecretN<S>,
    i: FixI<SecretI<S>>,
    d: FixD<SecretD<S>>,
}

type ToN<T extends number> = `${T}` extends `-${string}` ? true : false
type GetNumStr<T extends number> = `${T}` extends `-${infer S}` ? S : `${T}`
type GetInt<T> = T extends `${infer I}.${string}` ? I : T
type GetDec<T> = T extends `${string}.${infer D}` ? D : ""
type ToNumArray<T> = T extends `${infer F}${infer R}` ? [F, ...ToNumArray<R>] : []

type ToNumObj<T extends number> = {
    n: ToN<T>,
    i: ToNumArray<GetInt<GetNumStr<T>>>,
    d: ToNumArray<GetDec<GetNumStr<T>>>,
}

type NumObj = {
    n: boolean,
    i: string[],
    d: string[],
}

type CheckN<
    E extends NumObj,
    L extends NumObj
> = E["n"] extends L["n"]
    ? Eq
    : [E["n"], L["n"]] extends [false, true]
        ? Gt
        : Lt

type CheckA<E, L, N extends boolean = false> = [E, L] extends [
    [infer F1, ...infer R1],
    [infer F2 extends keyof LtMap, ...infer R2]
] ? F1 extends F2
    ? CheckA<R1, R2, N>
    : F1 extends LtMap[F2] ? Lt<N> : Gt<N>
  : Eq

type CheckL<
    E extends unknown[],
    L extends unknown[],
    N extends boolean = false
> = [E, L] extends [
    [unknown, ...infer R1],
    [unknown, ...infer R2]
] ? CheckL<R1, R2, N>
  : [E["length"], L["length"]] extends [0, 0]
    ? Eq
    : E["length"] extends 0 ? Lt<N> : Gt<N>

type GuessingNumber<
    T extends number,
    S extends string
> = ToNumObj<T> extends infer E extends NumObj
    ? GenerateSecret<S> extends infer L extends NumObj
        ? CheckN<E, L> extends infer RN
            ? RN extends Eq
                ? CheckL<E["i"], L["i"], L["n"]> extends infer RIL
                    ? RIL extends Eq
                        ? CheckA<E["i"], L["i"], L["n"]> extends infer RI
                            ? RI extends Eq
                                ? CheckA<E["d"], L["d"], L["n"]> extends infer RD
                                    ? RD extends Eq
                                        ? CheckL<E["d"], L["d"], L["n"]>
                                        : RD
                                    : unknown
                                : RI
                            : unknown
                        : RIL
                    : unknown
                : RN
            : unknown
        : unknown
    : unknown

export type GameStart<S extends string> = {
    guessingNumber: <E extends number>(expected: E) => GuessingNumber<E, S>,
    check: (v: Eq) => void,
}

declare function gameStart<S extends string>(secret: S): GameStart<S>

const { guessingNumber, check } = gameStart("p@ssW0rd")

check(guessingNumber(-388079.9))
