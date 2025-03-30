import {BuildTimeConfig} from '../types';

export function extractTraits<Origin, Result = Origin, PostBuildResult = Result, Trait extends string = string>(
    buildTimeConfig?: BuildTimeConfig<Origin, Result, PostBuildResult, Trait>,
) {
    const traits = buildTimeConfig?.traits;
    return Array.isArray(traits) ? traits : traits ? [traits] : [];
}
