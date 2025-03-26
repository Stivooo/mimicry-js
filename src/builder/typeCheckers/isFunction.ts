export function isFunction<Fn extends (...args: any[]) => any>(value: unknown): value is Fn {
    return typeof value === 'function';
}
