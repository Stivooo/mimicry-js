import {BuildTimeConfig, Overrides} from '../types';

export function extractOverrides<Preset, Result, Initials>(
    config?: BuildTimeConfig<Preset, unknown, Result, Initials>,
): Overrides<Preset> {
    return config?.overrides ?? {};
}
