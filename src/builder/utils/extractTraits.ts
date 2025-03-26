import {BuildTimeConfig} from '../types';

export function extractTraits<Result, Trait extends string, MappedResult, Parameters extends any[]>(
    buildTimeConfig?: BuildTimeConfig<Result, Trait, MappedResult, Parameters>,
) {
    const traits = buildTimeConfig?.traits;
    return Array.isArray(traits) ? traits : traits ? [traits] : [];
}
