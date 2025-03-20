export function oneOf<T>(options: T[]): Generator<T, never, never>;
export function oneOf<T>(options: T): Generator<T, never, never>;
export function oneOf<T>(...options: T[]): Generator<T, never, never>;
export function* oneOf<T>(options: T[] | T, ...rest: T[]): Generator<T, never, never> {
    const optionsArray = Array.isArray(options) ? options : [options, ...rest];
    while (true) {
        yield optionsArray[Math.floor(Math.random() * optionsArray.length)];
    }
}
