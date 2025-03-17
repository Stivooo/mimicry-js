import {FixedValue} from '../generators/fixed';

export type FunctionalGenerator<T> = () => T;

export type FieldGenerator<T> = FunctionalGenerator<T> | Iterator<T, T>;

export type FieldType<T> = T | FixedValue<T> | FieldGenerator<T> | FieldsConfiguration<T>;

export type FieldsConfiguration<Result> = {
    readonly [Key in keyof Result]: FieldType<Result[Key]>;
};

export type FieldsConfigurationGenerator<FactoryResult> = (
    prevBuild?: FactoryResult,
) => FieldsConfiguration<FactoryResult>;

export type BuilderConfiguration<FactoryResult, PostBuildResult = FactoryResult, TraitName extends string = string> = {
    readonly fields: FieldsConfiguration<FactoryResult> | FieldsConfigurationGenerator<FactoryResult>;
    readonly traits?: TraitsConfiguration<FactoryResult, TraitName>;
    readonly postBuild?: (x: FactoryResult) => PostBuildResult;
};

export type Overrides<Result> = {
    [Key in keyof Result]?: FieldType<Result[Key]>;
};

export type BuildTimeConfig<Result, Trait, MappedResult = Result> = {
    overrides?: Overrides<Result>;
    postBuild?: (builtThing: Result) => MappedResult;
    traits?: Trait | Trait[];
};

export type FreezeKeys<T> = {
    [Key in keyof T as Key]: T[Key];
};

export type TraitsConfiguration<FactoryResultType, TraitName extends string> = {
    [key in TraitName]: {overrides?: Overrides<FreezeKeys<FactoryResultType>>};
};

export type ExtractTraitsNames<Config> = Config extends BuilderConfiguration<any, any, infer Traits> ? Traits : never;
