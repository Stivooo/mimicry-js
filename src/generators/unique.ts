/**
 * @description Returns unique option as long as it is available; otherwise, throw Error.
 * @throws Error
 */
export function unique<T>(options: T[]): Generator<T, never, never>;
export function unique<T>(options: T): Generator<T, never, never>;
export function unique<T>(...options: T[]): Generator<T, never, never>;
export function* unique<T>(options: T[]): Generator<T, never, never> {
    const leftOptions = options.concat();

    while (true) {
        if (!leftOptions.length) {
            throw new Error('No unique options left!');
        }
        const index = Math.floor(Math.random() * leftOptions.length);
        const option = leftOptions[index];
        leftOptions.splice(index, 1);
        yield option;
    }
}
