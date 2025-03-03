export function oneOf<T>(options: T[]): Generator<T>;
export function oneOf<T>(options: T): Generator<T>;
export function oneOf<T>(...options: T[]): Generator<T>;
export function* oneOf<T>(options: T[] | T, ...rest: T[]): Generator<T, never, never> {
    const variants = Array.isArray(options) ? options : [options, ...rest];
    while (true) {
        yield variants[Math.floor(Math.random() * variants.length)];
    }
}
