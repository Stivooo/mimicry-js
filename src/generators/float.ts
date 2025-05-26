import {random} from '../random/random';

const DEFAULT_MIN_FLOAT = 0;
const DEFAULT_MAX_FLOAT = 1;

/**
 * Generated random float value
 *
 * @param min - Lower bound of the number. Default is 0.
 * @param max - Upper bound of the number. Default is 1.
 */
export function float(): number;
export function float(max: number): number;
export function float(min: number, max: number): number;
export function float(min?: number, max?: number): number {
    min = min !== undefined && max !== undefined ? min : DEFAULT_MIN_FLOAT;
    max = max ?? min ?? DEFAULT_MAX_FLOAT;

    if (min > max) {
        [min, max] = [max, min];
    }

    return random() * (max - min) + min;
}
