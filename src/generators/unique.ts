import {ResetSignal} from '../reset/ResetSignal';
import {resetable} from '../reset/resetable';

import {int} from './int';

/**
 * @description Returns unique option as long as it is available; otherwise, throw Error.
 * @throws Error
 */
export function unique<T>(options: T[]): Generator<T, never, ResetSignal>;
export function unique<T>(options: T): Generator<T, never, ResetSignal>;
export function unique<T>(...options: T[]): Generator<T, never, ResetSignal>;
export function* unique<T>(options: T[] | T, ...rest: T[]): Generator<T, never, ResetSignal> {
    const optionsArray = Array.isArray(options) ? options : [options, ...rest];
    const {val, set, use} = resetable(optionsArray.concat());

    while (true) {
        const leftOptions = val().concat();
        if (!leftOptions.length) {
            throw new Error('No unique options left!');
        }
        const uniqueIndex = int(0, leftOptions.length - 1);
        const uniqueValue = leftOptions[uniqueIndex];
        leftOptions.splice(uniqueIndex, 1);
        set(leftOptions);
        use(yield uniqueValue);
    }
}
