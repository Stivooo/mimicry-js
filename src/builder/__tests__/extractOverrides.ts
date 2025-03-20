import {BuildTimeConfig, Overrides} from '../types';

export function extractOverrides<Preset, Result>(config?: BuildTimeConfig<Preset, unknown, Result>): Overrides<Preset> {
    return config?.overrides ?? {};
}
