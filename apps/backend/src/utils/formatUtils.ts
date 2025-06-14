type NullToUndefined<T> = {
    [K in keyof T]: T[K] extends null
        ? undefined
        : Exclude<T[K], null> | (null extends T[K] ? undefined : never);
};

export function nullToUndefined<T extends {}>(obj: T): NullToUndefined<T> {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, value === null ? undefined : value])
    ) as NullToUndefined<T>;
}
