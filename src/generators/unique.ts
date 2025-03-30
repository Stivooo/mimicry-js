import {ResetSignal} from '../reset/ResetSignal';
import {resetable} from '../reset/resetable';

/**
 * @description Returns unique option as long as it is available; otherwise, throw Error.
 * @throws Error
 */
export function unique<T>(options: T[]): Generator<T, never, ResetSignal>;
export function unique<T>(options: T): Generator<T, never, ResetSignal>;
export function unique<T>(...options: T[]): Generator<T, never, ResetSignal>;
export function* unique<T>(this: Generator, options: T[] | T, ...rest: T[]): Generator<T, never, ResetSignal> {
    const optionsArray = Array.isArray(options) ? options : [options, ...rest];
    const {val, set, use} = resetable(optionsArray.concat());

    while (true) {
        const leftOptions = val().concat();
        if (!leftOptions.length) {
            throw new Error('No unique options left!');
        }
        const uniqueValue = leftOptions.shift() as T;
        set(leftOptions);
        use(yield uniqueValue);
    }
}
