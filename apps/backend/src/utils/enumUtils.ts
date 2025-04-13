export function enumToTypebox<T extends Record<string, string>>(e: T): T {
    const filtered: any = {};
    for (const key in e) {
        if (typeof e[key] === 'string') {
            filtered[key] = e[key];
        }
    }
    return filtered;
}