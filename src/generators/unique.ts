/**
 * @description Returns unique option as long as it is available; otherwise, throw Error.
 * @throws Error
 */
export function unique<T>(options: T[]): Generator<T, never, never>;
export function unique<T>(options: T): Generator<T, never, never>;
export function unique<T>(...options: T[]): Generator<T, never, never>;
export function* unique<T>(options: T[] | T, ...rest: T[]): Generator<T, never, never> {
    const optionsArray = Array.isArray(options) ? options : [options, ...rest];
    const leftOptions = optionsArray.concat();

    while (true) {
        if (!leftOptions.length) {
            throw new Error('No unique options left!');
        }
        yield leftOptions.shift() as T;
    }
}
