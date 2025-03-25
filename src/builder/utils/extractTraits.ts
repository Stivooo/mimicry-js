import {BuildTimeConfig} from '../types';

export function extractTraits<Result, Trait extends string, MappedResult, Initials>(
    buildTimeConfig?: BuildTimeConfig<Result, Trait, MappedResult, Initials>,
) {
    const traits = buildTimeConfig?.traits;
    return Array.isArray(traits) ? traits : traits ? [traits] : [];
}
