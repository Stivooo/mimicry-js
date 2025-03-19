import {
    BuilderConfiguration,
    BuildTimeConfig,
    ExtractTraitsNames,
    FieldsConfiguration,
    FieldsConfigurationGenerator,
    FieldType,
    FreezeKeys,
    Mutable,
    Overrides,
    TraitsConfiguration,
} from './types';
import {isFixedValue} from '../generators/fixed';
import {extractOverrides, extractTraits, makeMutable, map} from './utils';
import {isClassInstance} from '../typeCheckers/isClassInstance';
import {isIterator} from '../typeCheckers/isIterator';
import {isCallable} from '../typeCheckers/isCallable';
import {deepMerge} from './utils/deepMerge';

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
        const buildOverrides = extractOverrides(config);
        const buildTraitsOverrides = extractTraits(config).reduce<Overrides<Fields>>((traitsOverrides, traitKey) => {
            if (!this.traits?.[traitKey]) {
                console.warn(`Trait "${String(traitKey)}" is not specified in buildConfig!`);
            }
            const traitsConfig = this.traits ? this.traits[traitKey] : ({} as TraitsConfiguration<Preset, string>);
            const currentTraitOverrides = traitsConfig.overrides ?? {};
            return deepMerge(traitsOverrides, currentTraitOverrides);
        }, {});

        const combinedWithTraits = deepMerge(fields, buildTraitsOverrides);
        const combinedWithOverrides = deepMerge(combinedWithTraits, buildOverrides);

        return map(combinedWithOverrides, (originalValue) => this.extractValue(originalValue));
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
}

export const build = Builder.create;
