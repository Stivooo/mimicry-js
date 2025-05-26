import {
    Builder,
    BuilderConfiguration,
    BuildTimeConfig,
    FieldsConfiguration,
    FieldsConfigurationGenerator,
    FieldType,
    IteratorsConfiguration,
    Overrides,
    TraitsConfiguration,
} from './types';
import {isFixedValue} from '../generators/fixed';
import {isClassInstance} from './typeCheckers/isClassInstance';
import {isIterator} from './typeCheckers/isIterator';
import {isCallable} from './typeCheckers/isCallable';
import {deepMerge} from './utils/deepMerge';
import {isPlainObject} from './typeCheckers/isPlainObject';
import {map} from './utils/map';
import {extractTraits} from './utils/extractTraits';
import {extractOverrides} from './utils/extractOverrides';
import {extractFieldsConfiguration} from './utils/extractFieldsConfiguration';
import {extractInitialParameters} from './utils/extractInitialParameters';
import {ResetableSignal} from '../reset/ResetableSignal';

function createBuilder<Origin, Result = Origin, Trait extends string = string, InitialParameters extends any[] = never>(
    config: BuilderConfiguration<Origin, Result, Trait, InitialParameters>,
): Builder<Origin, Result, Trait, InitialParameters> {
    const fieldsConfiguration = extractFieldsConfiguration(config.fields);

    const traits: TraitsConfiguration<Origin, Trait> | undefined = config.traits;
    const postBuild: ((x: Origin) => Result) | undefined = config.postBuild;

    let definedIterators: IteratorsConfiguration<Origin> | null = null;
    let previousBuildFields: Origin | undefined;
    let fieldsConfigurationGenerator: FieldsConfigurationGenerator<Origin> | null = null;

    const resetSignal = new ResetableSignal();

    const mapFieldsWithOverrides = <Fields = Origin, PostBuildResult = Result>(
        fields: FieldsConfiguration<Fields>,
        buildConfig?: BuildTimeConfig<Fields, Result, PostBuildResult, Trait>,
    ) => {
        if (!isPlainObject(fields)) {
            return fields;
        }

        const buildOverrides = extractOverrides(buildConfig);
        const buildTraitsOverrides = extractTraits(buildConfig).reduce<Overrides<Fields>>(
            (traitsOverrides, traitKey) => {
                if (!traits?.[traitKey]) {
                    console.warn(`Trait "${String(traitKey)}" is not specified in buildConfig!`);
                }
                const traitsConfig = traits ? traits[traitKey] : ({} as TraitsConfiguration<Fields>);
                const currentTraitOverrides = traitsConfig.overrides ?? {};
                return deepMerge(traitsOverrides, currentTraitOverrides);
            },
            {},
        );

        const combinedWithTraits = deepMerge(fields, buildTraitsOverrides);
        const combinedWithOverrides = deepMerge(combinedWithTraits, buildOverrides);

        return map(combinedWithOverrides, (originalValue) => extractValue(originalValue));
    };

    const extractIterators = <Fields extends Origin>(
        fields: FieldsConfiguration<Fields>,
    ): IteratorsConfiguration<Fields> => {
        if (definedIterators !== null) {
            return definedIterators as IteratorsConfiguration<Fields>;
        }

        const newIterators = {} as IteratorsConfiguration<Fields>;

        for (const fieldName in fields) {
            const value = fields[fieldName];

            if (isIterator(value)) {
                newIterators[fieldName] = value as Iterator<Fields[Extract<keyof Fields, string>]>;
            } else if (isPlainObject<FieldsConfiguration<Fields>>(value)) {
                const nestedIterators = extractIterators(value) as IteratorsConfiguration<
                    Fields[Extract<keyof Fields, string>]
                >;

                if (Object.keys(nestedIterators).length) {
                    newIterators[fieldName] = nestedIterators;
                }
            }
        }

        definedIterators = newIterators;

        return definedIterators as IteratorsConfiguration<Fields>;
    };

    const extractValue = <Value>(field: FieldType<Value>): Value | Record<string, Value> => {
        if (field === null || field === undefined) {
            return field;
        }

        if (isFixedValue(field)) {
            return field.value;
        }

        if (isCallable(field)) {
            return field();
        }

        if (isIterator(field)) {
            return field.next(resetSignal).value as Value;
        }

        if (isClassInstance<Value>(field)) {
            return field;
        }

        if (Array.isArray(field)) {
            return field.map((value) => extractValue(value)) as Value;
        }

        if (isPlainObject(field)) {
            return mapFieldsWithOverrides(field) as Record<string, Value>;
        }

        return field;
    };

    const initFieldsGenerator = <PostBuildResult = Result>(
        buildConfig?: BuildTimeConfig<Origin, Result, PostBuildResult, Trait, InitialParameters>,
    ) => {
        if (!fieldsConfiguration.originFieldsGenerator) {
            return;
        }

        const initialParameters = extractInitialParameters(buildConfig?.initialParameters);
        fieldsConfigurationGenerator = fieldsConfiguration.originFieldsGenerator(...initialParameters);
    };

    const build = <PostBuildResult = Result>(buildConfig?: BuildTimeConfig<Origin, Result, PostBuildResult, Trait>) => {
        let fieldsForProcessing: FieldsConfiguration<Origin>;

        if (fieldsConfiguration.originFieldsFunction) {
            const iterationFields = fieldsConfiguration.originFieldsFunction(previousBuildFields);
            fieldsForProcessing = deepMerge(iterationFields, extractIterators(iterationFields));
        } else if (fieldsConfiguration.originFieldsGenerator) {
            if (!fieldsConfigurationGenerator) {
                throw Error("The fields GeneratorFunction isn't initialized!");
            }

            const iterationFields = fieldsConfigurationGenerator.next(previousBuildFields)
                .value as FieldsConfiguration<Origin>;
            fieldsForProcessing = deepMerge(iterationFields, extractIterators(iterationFields));
        } else {
            fieldsForProcessing = fieldsConfiguration.originFields;
        }

        const fields = mapFieldsWithOverrides(fieldsForProcessing, buildConfig);

        previousBuildFields = fields as Origin;

        const built = postBuild ? postBuild(fields as Origin) : fields;
        return buildConfig?.postBuild ? buildConfig.postBuild(built as Result) : (built as PostBuildResult);
    };

    return {
        one: <PostBuildResult = Result>(buildConfig?: BuildTimeConfig<Origin, Result, PostBuildResult, Trait>) => {
            initFieldsGenerator(buildConfig);
            return build(buildConfig);
        },
        many: <PostBuildResult = Result>(
            count: number,
            buildConfig?: BuildTimeConfig<Origin, Result, PostBuildResult, Trait>,
        ) => {
            initFieldsGenerator(buildConfig);
            return Array(count)
                .fill(0)
                .map(() => build(buildConfig));
        },
        reset: () => {
            resetSignal.reset();
        },
    };
}

export const build = createBuilder;
