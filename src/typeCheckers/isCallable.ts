export function isCallable<T extends (...args: any[]) => any>(value: unknown): value is T {
    return typeof value === 'function' && !/^class\s+/.test(Function.prototype.toString.call(value));
}
