import {Builder, BuilderConfiguration, BuildTimeConfig, FieldType, Overrides} from './types';
import {identity, isCallable, isClassInstance, isGeneratorFunction, isIterator} from '../utils';
import {isFixedFunction} from '../generators/func';

function extractTraits<Result>(buildTimeConfig?: BuildTimeConfig<Result>) {
    const traits = buildTimeConfig?.traits;
    return Array.isArray(traits) ? traits : traits ? [traits] : [];
}

function map<InputObject extends object, Key extends keyof InputObject, ResultValue>(
    object: InputObject,
    callback: (key: Key, value: InputObject[Key], current: Readonly<{[key in Key]: ResultValue}>) => ResultValue,
) {
    return (Object.keys(object) as Key[]).reduce(
        (total, key) => {
            total[key] = callback(key, object[key], total);
            return total;
        },
        {} as {[key in Key]: ResultValue},
    );
}

export const createBuilder = <Preset, Result = Preset>(config: BuilderConfiguration<Preset, Result>) => {
    const extractValue = <T>(
        field: FieldType<T, Result>,
        currentResult: Result,
    ): T | T[] | Set<T> | Map<unknown, T> => {
        if (field === null || field === undefined) {
            return field;
        }

        if (Array.isArray(field)) {
            return field.map((element) => extractValue(element, currentResult)) as T[];
        }

        if (field instanceof Set) {
            return new Set(Array.from(field).map((element) => extractValue(element, currentResult) as T));
        }

        if (field instanceof Map) {
            return new Map(Array.from(field).map(([key, value]) => [key, extractValue(value, currentResult)]));
        }

        if (isFixedFunction(field)) {
            return field.call as T;
        }

        if (isCallable(field)) {
            return field();
        }

        if (isIterator(field)) {
            return field.next().value;
        }

        if (isClassInstance(field)) {
            return field as T;
        }

        if (typeof field === 'object') {
            return map(field, (_, value) => extractValue(value, currentResult)) as T;
        }

        return field;
    };

    const getValueOrOverride = <
        O extends Overrides<Preset>,
        K extends keyof Preset,
        V extends FieldType<Preset[K], Preset>,
    >(
        overrides: O,
        traitOverrides: O,
        fieldValue: V,
        fieldKey: K,
    ) => {
        if (fieldKey in overrides) {
            return overrides[fieldKey];
        }

        if (fieldKey in traitOverrides) {
            return traitOverrides[fieldKey];
        }

        return fieldValue;
    };

    const builder = (buildConfig?: BuildTimeConfig<Preset>) => {
        const fields = map(config.fields, (key, fieldValue, currentResult) => {
            const buildOverrides: Overrides<Preset> = buildConfig?.overrides ?? {};
            const buildTraits = extractTraits(buildConfig);
            const buildTraitsOverrides = buildTraits.reduce<Overrides<Preset>>((overrides, traitKey) => {
                const hasTrait = config.traits && config.traits[traitKey];
                if (!hasTrait) {
                    console.warn(`Trait "${traitKey}" is not specified in config!`);
                }
                const traitsConfig = config.traits ? config.traits[traitKey] : {};
                const traitsOverrides = traitsConfig.overrides ?? {};
                return {...overrides, ...traitsOverrides};
            }, {});

            const originalValue = getValueOrOverride(buildOverrides, buildTraitsOverrides, fieldValue, key);
            return extractValue(originalValue, currentResult as Result);
        });

        const postBuild = config.postBuild ?? identity;

        return postBuild(fields as Preset);
    };

    builder.one = (buildConfig?: BuildTimeConfig<Preset>) => {
        return builder(buildConfig);
    };

    builder.many = (count: number, buildConfig?: BuildTimeConfig<Preset>) => {
        return Array(count)
            .fill(0)
            .map(() => builder(buildConfig));
    };

    return builder as Builder<Result>;
};
