import {BuildTimeConfig} from '../types';

export function extractTraits<Result, Trait extends string, MappedResult>(
    buildTimeConfig?: BuildTimeConfig<Result, Trait, MappedResult>,
) {
    const traits = buildTimeConfig?.traits;
    return Array.isArray(traits) ? traits : traits ? [traits] : [];
}