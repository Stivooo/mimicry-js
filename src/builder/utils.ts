import {BuildTimeConfig, Overrides} from './types';

export function map<InputObject extends object, Key extends keyof InputObject, ResultValue = any>(
    object: InputObject,
    callback: (key: Key, value: InputObject[Key], current: Readonly<{[key in Key]?: ResultValue}>) => ResultValue,
) {
    return (Object.keys(object) as Key[]).reduce(
        (total, key) => {
            total[key] = callback(key, object[key], total);
            return total;
        },
        {} as {[key in Key]: ResultValue},
    );
}

export function extractTraits<Result, Trait extends string, MappedResult>(
    buildTimeConfig?: BuildTimeConfig<Result, Trait, MappedResult>,
) {
    const traits = buildTimeConfig?.traits;
    return Array.isArray(traits) ? traits : traits ? [traits] : [];
}

export function extractOverrides<Preset, Result>(config?: BuildTimeConfig<Preset, unknown, Result>): Overrides<Preset> {
    return config?.overrides ?? {};
}
