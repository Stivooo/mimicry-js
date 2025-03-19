import {isPlainObject} from '../../typeCheckers/isPlainObject';

export function deepMerge<T extends Record<string, unknown>, U extends Record<string, unknown>>(
    target: T,
    source: U,
): T & U {
    if (!isPlainObject(target) || !isPlainObject(source)) {
        return source as T & U;
    }

    const result: Record<string, unknown> = {...target};

    Object.keys(source).forEach((key) => {
        const targetValue = result[key];
        const sourceValue = source[key];

        if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
            result[key] = deepMerge(targetValue, sourceValue);
        } else {
            result[key] = sourceValue;
        }
    });

    return result as T & U;
}
