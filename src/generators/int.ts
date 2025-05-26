import {random} from '../random/random';

const DEFAULT_MIN_INT = 1;
const DEFAULT_MAX_INT = 1000;

/**
 * Generated random integer value
 *
 * @param min - Lower bound of the number. Default is 1.
 * @param max - Upper bound of the number. Default is 1000.
 */
export function int(): number;
export function int(max: number): number;
export function int(min: number, max: number): number;
export function int(min?: number, max?: number): number {
    min = min !== undefined && max !== undefined ? min : DEFAULT_MIN_INT;
    max = max ?? min ?? DEFAULT_MAX_INT;

    if (!Number.isInteger(min) || !Number.isInteger(max)) {
        throw new Error('int() expects integer arguments!');
    }

    if (min > max) {
        [min, max] = [max, min];
    }

    const range = max - min + 1;
    return Math.floor(random() * range) + min;
}
