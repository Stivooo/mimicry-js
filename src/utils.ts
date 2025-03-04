export function isClassInstance(value: unknown): boolean {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const proto = Object.getPrototypeOf(value);
    return proto !== null && proto !== Object.prototype;
}

export function isIterator<T = unknown>(value: unknown): value is Iterator<T> {
    return typeof value === 'object' && value !== null && typeof (value as Iterator<T>)?.next === 'function';
}

export function isCallable<T extends (...args: any[]) => any>(value: unknown): value is T {
    return typeof value === 'function' && !/^class\s+/.test(Function.prototype.toString.call(value));
}

export function isGeneratorFunction(value: unknown): value is GeneratorFunction {
    return typeof value === 'function' && Object.prototype.toString.call(value) === '[object GeneratorFunction]';
}
