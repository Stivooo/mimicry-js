import {
    BuilderConfiguration,
    BuildTimeConfig,
    ExtractTraitsNames,
    FieldsConfiguration,
    FieldsConfigurationGenerator,
    FieldType,
    Overrides,
    TraitsConfiguration,
} from './types';
import {isFixedValue} from '../generators/fixed';
import {extractOverrides, extractTraits, map} from './utils';
import {isClassInstance} from '../typeCheckers/isClassInstance';
import {isIterator} from '../typeCheckers/isIterator';
import {isCallable} from '../typeCheckers/isCallable';

export class Builder<Preset, Build = Preset, Trait extends string = never> {
    private readonly fieldsGenerator: FieldsConfigurationGenerator<Preset>;
    private readonly traits?: TraitsConfiguration<Preset, Trait>;
    private readonly postBuild?: (x: Preset) => Build;

    private previousPreBuild?: Preset;

    protected constructor({fields, traits, postBuild}: BuilderConfiguration<Preset, Build, Trait>) {
        this.fieldsGenerator = typeof fields === 'function' ? fields : () => fields;
        this.traits = traits;
        this.postBuild = postBuild;
    }

    public one<MapperBuild = Build>(buildConfig?: BuildTimeConfig<Preset, Trait, MapperBuild>) {
        return this.build(buildConfig);
    }

    public many<MapperBuild = Build>(count: number, buildConfig?: BuildTimeConfig<Preset, Trait, MapperBuild>) {
        return Array(count)
            .fill(0)
            .map(() => this.build(buildConfig));
    }

    public static create<
        Preset,
        Build = Preset,
        Traits extends ExtractTraitsNames<BuilderConfiguration<Preset, Build>> = ExtractTraitsNames<
            BuilderConfiguration<Preset, Build>
        >,
    >(config: BuilderConfiguration<Preset, Build, Traits>) {
        return new Builder(config);
    }

    private mapFieldsWithOverrides<Fields = Preset, MapperBuild = Build>(
        fields: FieldsConfiguration<Fields>,
        config?: BuildTimeConfig<Fields, Trait, MapperBuild>,
    ) {
        return map(fields, (key, fieldValue) => {
            const buildOverrides = extractOverrides(config);
            const buildTraits = extractTraits(config);
            const buildTraitsOverrides = buildTraits.reduce<Overrides<Fields>>((overrides, traitKey) => {
                if (!this.traits?.[traitKey]) {
                    console.warn(`Trait "${String(traitKey)}" is not specified in buildConfig!`);
                }
                const traitsConfig = this.traits ? this.traits[traitKey] : ({} as TraitsConfiguration<Preset, string>);
                const traitsOverrides = traitsConfig.overrides ?? {};
                return {...overrides, ...traitsOverrides};
            }, {});

            const originalValue = this.getValueOrOverride<Fields, Overrides<Fields>>(
                buildOverrides,
                buildTraitsOverrides,
                fieldValue,
                key,
            );
            return this.extractValue(originalValue);
        });
    }

    private build<MapperBuild = Build>(buildConfig?: BuildTimeConfig<Preset, Trait, MapperBuild>) {
        const configFields = this.fieldsGenerator(this.previousPreBuild);
        const fields = this.mapFieldsWithOverrides(configFields, buildConfig);
        this.previousPreBuild = fields as Preset;
        const build = this.postBuild ? this.postBuild(fields as Preset) : fields;
        return buildConfig?.postBuild ? buildConfig.postBuild(build as Preset) : (build as MapperBuild);
    }

    public extractValue<Value>(field: FieldType<Value>): Value | Record<string, Value> {
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
            return field.next().value;
        }

        if (isClassInstance<Value>(field)) {
            return field;
        }

        if (Array.isArray(field)) {
            return field.map((value) => this.extractValue(value)) as Value;
        }

        if (typeof field === 'object') {
            return this.mapFieldsWithOverrides(field) as Record<string, Value>;
        }

        return field;
    }

    private getValueOrOverride<
        F,
        O extends Overrides<F> = Overrides<F>,
        K extends keyof F = keyof F,
        V extends FieldType<F[K]> = FieldType<F[K]>,
    >(overrides: O, traitOverrides: O, fieldValue: V, fieldKey: K) {
        if (fieldKey in overrides) {
            return overrides[fieldKey];
        }

        if (fieldKey in traitOverrides) {
            return traitOverrides[fieldKey];
        }

        return fieldValue;
    }
}

export const build = Builder.create;
