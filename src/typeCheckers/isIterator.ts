export function isIterator<T = unknown>(value: unknown): value is Iterator<T> {
    return typeof value === 'object' && value !== null && typeof (value as Iterator<T>)?.next === 'function';
}
