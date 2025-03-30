import {BuildTimeConfig, Overrides} from '../types';

export function extractOverrides<Origin, Result = Origin, PostBuildResult = Result>(
    config?: BuildTimeConfig<Origin, Result, PostBuildResult>,
): Overrides<Origin> {
    return config?.overrides ?? {};
}
