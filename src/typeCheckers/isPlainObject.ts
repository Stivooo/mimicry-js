import {isClassInstance} from './isClassInstance';
import {isIterator} from './isIterator';

export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
    return (
        !!obj &&
        typeof obj === 'object' &&
        !Array.isArray(obj) &&
        !isClassInstance(obj) &&
        !isIterator(obj) &&
        Object.prototype.toString.call(obj) === '[object Object]'
    );
}
