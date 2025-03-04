import {
    BuilderConfiguration,
    BuildTimeConfig,
    ExtractTraitsNames,
    FieldsConfiguration,
    FieldType,
    Overrides,
    TraitsConfiguration,
} from './types';
import {isCallable, isClassInstance, isIterator} from '../utils';
import {isFixedFunction} from '../generators/func';
import {map} from './map';

function extractTraits<Result, Trait extends string, MappedResult>(
    buildTimeConfig?: BuildTimeConfig<Result, Trait, MappedResult>,
) {
    const traits = buildTimeConfig?.traits;
    return Array.isArray(traits) ? traits : traits ? [traits] : [];
}

export class Builder<Preset, Build = Preset, Trait extends string = never> {
    private readonly fields: FieldsConfiguration<Preset>;
    private readonly traits?: TraitsConfiguration<Preset, Trait>;
    private readonly postBuild?: (x: Preset) => Build;

    protected constructor({fields, traits, postBuild}: BuilderConfiguration<Preset, Build, Trait>) {
        this.fields = fields;
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

    private build<MapperBuild = Build, Trait extends string = string>(
        buildConfig?: BuildTimeConfig<Preset, Trait, MapperBuild>,
    ) {
        const fields = map(this.fields, (key, fieldValue) => {
            const buildOverrides: Overrides<Preset> = buildConfig?.overrides ?? {};
            const buildTraits = extractTraits(buildConfig);
            const buildTraitsOverrides = buildTraits.reduce<Overrides<Preset>>((overrides, traitKey) => {
                if (!this.traits?.[traitKey]) {
                    console.warn(`Trait "${String(traitKey)}" is not specified in config!`);
                }
                const traitsConfig = this.traits ? this.traits[traitKey] : ({} as TraitsConfiguration<Preset, never>);
                const traitsOverrides = traitsConfig.overrides ?? {};
                return {...overrides, ...traitsOverrides};
            }, {});

            const originalValue = this.getValueOrOverride(buildOverrides, buildTraitsOverrides, fieldValue, key);
            return this.extractValue(originalValue);
        });

        const build = this.postBuild ? this.postBuild(fields as Preset) : fields;
        return buildConfig?.postBuild ? buildConfig.postBuild(build as Preset) : (build as MapperBuild);
    }

    public extractValue<Value>(field: FieldType<Value>): Value {
        if (field === null || field === undefined) {
            return field;
        }

        if (isFixedFunction(field)) {
            return field.call as Value;
        }

        if (isCallable(field)) {
            return field();
        }

        if (isIterator(field)) {
            return field.next().value;
        }

        if (isClassInstance(field)) {
            return field as Value;
        }

        return field;
    }

    private getValueOrOverride<O extends Overrides<Preset>, K extends keyof Preset, V extends FieldType<Preset[K]>>(
        overrides: O,
        traitOverrides: O,
        fieldValue: V,
        fieldKey: K,
    ) {
        if (fieldKey in overrides) {
            return overrides[fieldKey];
        }

        if (fieldKey in traitOverrides) {
            return traitOverrides[fieldKey];
        }

        return fieldValue;
    }
}

export const createBuilder = Builder.create;
