import type {
    SkipNextPair,
    RemoveSpace,
    Split,
    Parse2Define,
    FromDefine,
    FromSchema,
} from '../types.js';

type Expect<T extends true> = T
type IsExtends<T1, T2> = T1 extends T2 ? true : false
type IsAny<T> = 1 extends 0 & T ? true : false
type IsNever<T> = [T] extends [never] ? true : false
type Not<T extends boolean> = T extends true ? false : true
type Every<T> = T extends []
    ? true
    : T extends [infer F, ...infer R]
        ? F extends true
            ? Every<R>
            : false
    : false

{
    type A1 = SkipNextPair<"sample\" | number", "\"">
    type A2 = SkipNextPair<"Map<number, string>> | null", "<">
    type C = Expect<Every<[
        Not<IsAny<A1>>,
        Not<IsNever<A1>>,
        IsExtends<["sample", " | number"], A1>,
        IsExtends<["Map<number, string>", " | null"], A2>,
    ]>>
}

{
    type A1 = RemoveSpace<"(number | \"sample test\" | boolean) []">
    type C = Expect<Every<[
        Not<IsAny<A1>>,
        Not<IsNever<A1>>,
        IsExtends<"(number|\"sample test\"|boolean)[]", A1>
    ]>>
}

{
    type A1 = Split<RemoveSpace<"Set<number | string> | undefined | null">, "|">
    type C = Expect<Every<[
        Not<IsAny<A1>>,
        Not<IsNever<A1>>,
        IsExtends<["Set<number|string>", "undefined", "null"], A1>
    ]>>
}

{
    type A1 = FromDefine<Parse2Define<RemoveSpace<"Set<number | string> | undefined | null">, {}>>
    type C = Expect<Every<[
        Not<IsAny<A1>>,
        Not<IsNever<A1>>,
        IsExtends<Set<string | number> | null | undefined, A1>
    ]>>
}

{
    type A1 = FromSchema<{
        id: "@number",
        name: "@string",
        gender: "@\"male\" | \"female\"",
        birthOn: "@Date",
        age: "@number | null",
        "family?": [{
            familyNo: "@number",
            name: "@string",
            gender: "@\"male\" | \"female\"",
        }]
    }, {}>
    type C = Expect<Every<[
        Not<IsAny<A1>>,
        Not<IsNever<A1>>,
        IsExtends<{
            id: number,
            name: string,
            gender: "male" | "female",
            birthOn: Date,
            age: number | null,
            family?: {
                familyNo: number,
                name: string,
                gender: "male" | "female",
            }[]
        }, A1>
    ]>>
}

{
    type A1 = FromSchema<{
        type: "map",
        key: "@number",
        value: [{
            cdNo: "@string",
            data: "@Set<string | boolean>",
        }]
    }, {}>
    type C = Expect<Every<[
        Not<IsAny<A1>>,
        Not<IsNever<A1>>,
        IsExtends<Map<number, {
            cdNo: string,
            data: Set<string | boolean>,
        }[]>, A1>
    ]>>
}

{
    type A1 = FromSchema<{
        type: "map",
        key:  { data: "@Data" },
        value: {
            type: "union",
            value: [{ data: "@Data" }, "@string"],
        }
    }, { Data: (arg: unknown) => arg is string }>
    type C = Expect<Every<[
        Not<IsAny<A1>>,
        Not<IsNever<A1>>,
        IsExtends<Map<{ data: string }, { data: string } | string>, A1>
    ]>>
}