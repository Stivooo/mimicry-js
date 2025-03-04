import {FixedFunction} from '../generators/func';

type Function<T> = () => T;

export type FieldGenerator<T> = Function<T> | Iterator<T, T>;

export type FieldType<T> = T | FixedFunction | FieldGenerator<T>;

export type FieldsConfiguration<Result> = {
    readonly [Key in keyof Result]: FieldType<Result[Key]>;
};

export type Overrides<Result = unknown> = {
    [Key in keyof Result]?: FieldType<Result[Key]>;
};

export type BuildTimeConfig<Result, Trait, MappedResult = Result> = {
    overrides?: Overrides<Result>;
    postBuild?: (builtThing: Result) => MappedResult;
    traits?: Trait | Trait[];
};

export type BuilderConfiguration<FactoryResult, PostBuildResult = FactoryResult, TraitName extends string = string> = {
    readonly fields: FieldsConfiguration<FactoryResult>;
    readonly traits?: TraitsConfiguration<FactoryResult, TraitName>;
    readonly postBuild?: (x: FactoryResult) => PostBuildResult;
};

export type TraitsConfiguration<FactoryResultType, TraitName extends string> = Record<
    TraitName,
    {overrides?: Overrides<FactoryResultType>}
> & {[key: string]: unknown};

export type ExtractTraitsNames<Config> = Config extends BuilderConfiguration<any, any, infer Traits> ? Traits : never;
