import {BuildTimeConfig, Overrides} from '../types';

export function extractOverrides<Preset, Result, Parameters extends any[]>(
    config?: BuildTimeConfig<Preset, unknown, Result, Parameters>,
): Overrides<Preset> {
    return config?.overrides ?? {};
}
