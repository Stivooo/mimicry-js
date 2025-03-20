import {isClassInstance} from './isClassInstance';
import {isIterator} from './isIterator';

export function isPlainObject<T extends Record<string, unknown>>(obj: unknown): obj is T {
    return (
        !!obj &&
        typeof obj === 'object' &&
        !Array.isArray(obj) &&
        !isClassInstance(obj) &&
        !isIterator(obj) &&
        Object.prototype.toString.call(obj) === '[object Object]'
    );
}
