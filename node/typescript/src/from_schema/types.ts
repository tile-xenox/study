//#region const
type SymbolPairMap = {
    "\"": "\"",
    "[": "]",
    "(": ")",
    "<": ">",
}
type PrimitiveTypeMap = {
    number: number,
    string: string,
    boolean: boolean,
    Date: Date,
    null: null,
    undefined: undefined,
    unknown: unknown,
    never: never,
}
//#endregion
//#region util type
type Plus1<T extends unknown[]> = [unknown, ...T]
type Minus1<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never
export type SkipNextPair<
    S,
    Sym extends keyof SymbolPairMap,
    Acc extends string = "",
    C extends unknown[] = [],
> = S extends `${infer F}${infer R}`
    ? F extends SymbolPairMap[Sym]
        ? C['length'] extends 0
            ? [Acc, R]
            : SkipNextPair<R, Sym, `${Acc}${F}`, Minus1<C>>
        : F extends Sym
            ? SkipNextPair<R, Sym, `${Acc}${F}`, Plus1<C>>
            : SkipNextPair<R, Sym, `${Acc}${F}`, C>
    : never

export type RemoveSpace<
    S,
    Acc extends string = ""
> = S extends `${infer F}${infer R}`
    ? F extends "\""
        ? SkipNextPair<R, "\""> extends [infer L extends string, infer O extends string]
            ? RemoveSpace<O, `${Acc}"${L}"`>
            : never
        : F extends " "
            ? RemoveSpace<R, Acc>
            : RemoveSpace<R, `${Acc}${F}`>
    : Acc

type Trim<S, T extends keyof SymbolPairMap> = S extends `${T}${infer R}`
    ? SkipNextPair<R, T> extends [infer I extends string, infer O extends string]
        ? O extends ""
            ? I
            : false
        : false
    : false

export type TrimRoundBrackets<S> = Trim<S, "("> extends infer R extends string
    ? R
    : S

export type Split<
    S,
    Delimiter,
    Acc extends string = ""
> = TrimRoundBrackets<S> extends `${infer F}${infer R}`
    ? F extends keyof SymbolPairMap
        ? SkipNextPair<R, F> extends [infer I extends string, infer O extends string]
            ? Split<O, Delimiter, `${Acc}${F}${I}${SymbolPairMap[F]}`>
            : never
        : F extends Delimiter
            ? [Acc, ...Split<R, Delimiter>]
            : Split<R, Delimiter, `${Acc}${F}`>
    : [Acc]

type GetPredicate<T> = T extends (arg: unknown) => arg is infer R ? R : unknown
//#endregion
//#region define and convert
// literal
type DLiteral<L> = {
    type: 'literal',
    value: L,
}
type ToDLiteral<S> = DLiteral<S>
type FromDLiteral<D> = D extends DLiteral<infer L> ? L : unknown
// map
type DMap<K, V> = {
    type: "map",
    key: K,
    value: V,
}
type ToDMap<S, C> = Split<S, ","> extends [infer K, infer V]
    ? DMap<Parse2Define<K, C>, Parse2Define<V, C>>
    : unknown
type FromDMap<D> = D extends DMap<infer K, infer V> ? Map<FromDefine<K>, FromDefine<V>> : unknown
// set
type DSet<V> = {
    type: "set",
    value: V,
}
type ToDSet<S, C> = DSet<Parse2Define<S, C>>
type FromDSet<D> = D extends DSet<infer V> ? Set<FromDefine<V>> : unknown
// union
type DUnion<U> = {
    type: "union",
    value: U,
}
type ToDUnion<T, C> = DUnion<MapParse<T, C>>
type FromDUnion<D> = D extends DUnion<infer U> ? MapFrom<U>[number] : unknown
// array
type DArray<V> = {
    type: "array",
    value: V,
}
type ToDArray<S, C> = DArray<Parse2Define<S, C>>
type FromDArray<D> = D extends DArray<infer V> ? FromDefine<V>[] : unknown
// tuple
type DTuple<V> = {
    type: "tuple",
    value: V,
}
type ToDTuple<S, C> = DTuple<MapParse<Split<S, ",">, C>>
type FromDTuple<D> = D extends DTuple<infer V> ? MapFrom<V> : unknown
// primitive
type DPrimitive<P> = {
    type: "primitive",
    value: P,
}
type ToDPrimitive<P> = DPrimitive<P>
type FromDPrimitive<D> = D extends DPrimitive<infer P> ? P : unknown
//#endregion
//#region parse to define from string
type TryParse2DArray<S, C> = S extends `${infer A}[]`
    ? ToDArray<A, C>
    : false

type TryParse2DTuple<S, C> = Trim<S, "["> extends infer T extends string
    ? ToDTuple<T, C>
    : false

type TryParse2DLiteral<S> = Trim<S, "\""> extends infer L extends string
    ? ToDLiteral<L>
    : false

type TryParse2DPrimitive<S, C> = S extends keyof C
    ? ToDPrimitive<C[S]>
    : S extends keyof PrimitiveTypeMap
        ? ToDPrimitive<PrimitiveTypeMap[S]>
        : false

type TryParse2DMap<S, C> = S extends `Map${infer R}`
    ? Trim<R, "<"> extends infer M extends string
        ? ToDMap<M, C>
        : false
    : false

type TryParse2DSet<S, C> = S extends `Set${infer R}`
    ? Trim<R, "<"> extends infer S extends string
        ? ToDSet<S, C>
        : false
    : false

type TryParse2DArray2<S, C> = S extends `Array${infer R}`
    ? Trim<R, "<"> extends infer A extends string
        ? ToDArray<A, C>
        : false
    : false

type FindNotFalse<T> = T extends [infer F, ...infer R]
    ? F extends false
        ? FindNotFalse<R>
        : F
    : unknown

export type Parse2Define<O, C, S = TrimRoundBrackets<O>> = Split<S, "|"> extends infer U extends unknown[]
    ? U['length'] extends 1
        ? FindNotFalse<[
            TryParse2DArray<S, C>,
            TryParse2DTuple<S, C>,
            TryParse2DLiteral<S>,
            TryParse2DPrimitive<S, C>,
            TryParse2DMap<S, C>,
            TryParse2DSet<S, C>,
            TryParse2DArray2<S, C>,
        ]>
        : ToDUnion<U, C>
    : unknown

type MapParse<T, C> = T extends [infer F, ...infer R]
    ? [Parse2Define<F, C>, ...MapParse<R, C>]
    : []
//#endregion
//#region from define
export type FromDefine<D> = D extends { type: `${infer T}` }
    ? {
        literal: FromDLiteral<D>,
        map: FromDMap<D>,
        set: FromDSet<D>,
        union: FromDUnion<D>,
        array: FromDArray<D>,
        tuple: FromDTuple<D>,
        primitive: FromDPrimitive<D>,
        [x: string]: unknown,
    }[T]
    : unknown

type MapFrom<T> = T extends [infer F, ...infer R]
    ? [FromDefine<F>, ...MapFrom<R>]
    : []
//#endregion
//#region from schema
type ToCustomMap<C> = {
    [K in keyof C]: GetPredicate<C[K]>
}

type TryFromStringSchema<T, C> = T extends `@${infer S}`
    ? FromDefine<Parse2Define<RemoveSpace<S>, ToCustomMap<C>>>
    : false

type TryFromUnionSchema<T, C> = T extends DUnion<infer V>
    ? MapFromSchema<V, C>[number]
    : false

type TryFromMapSchema<T, C> = T extends DMap<infer K, infer V>
    ? Map<FromSchema<K, C>, FromSchema<V, C>>
    : false

type TryFromSetSchema<T, C> = T extends DSet<infer V>
    ? Set<FromSchema<V, C>>
    : false

type FromObjectSchemaRequired<T, C> = {
    [K in keyof T as Exclude<K, `${string}?`>]: FromSchema<T[K], C>
}

type FromObjectSchemaPartial<T, C> = {
    [K in keyof T as K extends `${infer P}?` ? P : never]?: FromSchema<T[K], C>
}

type TryFromObjectSchema<T, C> = 
    & FromObjectSchemaRequired<T, C>
    & FromObjectSchemaPartial<T, C>

export type FromSchema<T, C> = T extends [unknown]
    ? FromSchema<T[0], C>[]
    : FindNotFalse<[
        TryFromStringSchema<T, C>,
        TryFromUnionSchema<T, C>,
        TryFromMapSchema<T, C>,
        TryFromSetSchema<T, C>,
        TryFromObjectSchema<T, C>,
    ]>

type MapFromSchema<T, C> = T extends [infer F, ...infer R]
    ? [FromSchema<F, C>, ...MapFromSchema<R, C>]
    : []
//#endregion
