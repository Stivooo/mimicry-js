import {FixedValue} from '../generators/fixed';

export type FunctionalGenerator<T> = () => T;

export type Identical<T> = T;

export type FieldGenerator<T> = FunctionalGenerator<T> | Iterator<T, T>;

export type FieldType<T> = Identical<T> | FixedValue<T> | FieldGenerator<T>;

export type FieldsConfiguration<Result> = {
    readonly [Key in keyof Result]: FieldType<Result[Key]>;
};

export type BuilderConfiguration<FactoryResult, PostBuildResult = FactoryResult, TraitName extends string = string> = {
    readonly fields: FieldsConfiguration<FactoryResult>;
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

export type TraitsConfiguration<FactoryResultType, TraitName extends string> = Record<
    TraitName,
    {overrides?: Overrides<FactoryResultType>}
> & {[key: string]: unknown};

export type ExtractTraitsNames<Config> = Config extends BuilderConfiguration<any, any, infer Traits> ? Traits : never;
