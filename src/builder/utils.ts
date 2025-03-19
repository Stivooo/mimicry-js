import {BuildTimeConfig, Mutable, Overrides} from './types';

export function map<InputObject extends object, Key extends keyof InputObject, ResultValue = any>(
    object: InputObject,
    callback: (value: InputObject[Key], key: Key, current: Readonly<{[key in Key]?: ResultValue}>) => ResultValue,
) {
    return (Object.keys(object) as Key[]).reduce(
        (total, key) => {
            total[key] = callback(object[key], key, total);
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

export function makeMutable<T>(entity: T): Mutable<T> {
    return entity as Mutable<T>;
}
