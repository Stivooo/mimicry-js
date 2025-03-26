import type {FixedValue} from '../generators/fixed';
import type {FieldsGenerator} from '../generators/generate';

export type FunctionalGenerator<T> = () => T;

export type FieldGenerator<T> = FunctionalGenerator<T> | Iterator<T, T>;

export type FieldType<T> = T | FixedValue<T> | FieldGenerator<T> | FieldsConfiguration<T>;

export type FieldsConfiguration<Result> = {
    readonly [Key in keyof Result]: FieldType<Result[Key]>;
};

export type FieldsConfigurationFunction<FactoryResult> = (
    prevBuild?: FactoryResult,
) => FieldsConfiguration<FactoryResult>;

export type FieldsConfigurationGenerator<FactoryResult> = Generator<
    FieldsConfiguration<FactoryResult>,
    FieldsConfiguration<FactoryResult>,
    FactoryResult | undefined
>;

export type FieldsConfigurationGeneratorFunction<FactoryResult, InitialParameters extends any[] = never> = (
    ...initialParameters: InitialParameters
) => FieldsConfigurationGenerator<FactoryResult>;

export type BuilderConfigurationFields<FactoryResult, InitialParameters extends any[] = never> =
    | FieldsConfiguration<FactoryResult>
    | FieldsConfigurationFunction<FactoryResult>
    | FieldsGenerator<FactoryResult, InitialParameters>;

export type BuilderConfiguration<
    FactoryResult,
    PostBuildResult = FactoryResult,
    TraitName extends string = string,
    InitialParameters extends any[] = never,
> = {
    readonly fields: BuilderConfigurationFields<FactoryResult, InitialParameters>;
    readonly traits?: TraitsConfiguration<FactoryResult, TraitName>;
    readonly postBuild?: (x: FactoryResult) => PostBuildResult;
};

export type Overrides<Result> = {
    [Key in keyof Result]?: FieldType<Result[Key]> | Overrides<Result[Key]>;
};

export type BuildTimeConfig<Result, Trait, MappedResult = Result, InitialParameters extends any[] = never> = {
    overrides?: Overrides<Result>;
    postBuild?: (builtThing: Result) => MappedResult;
    traits?: Trait | Trait[];
    initialParameters?: InitialParameters;
};

export interface Builder<
    FactoryResult,
    PostBuildResult = FactoryResult,
    TraitName extends string = string,
    InitialParameters extends any[] = never,
> {
    one<Result = PostBuildResult>(
        buildTimeConfig?: BuildTimeConfig<FactoryResult, TraitName, Result, InitialParameters>,
    ): Result;
    many<Result = PostBuildResult>(
        count: number,
        buildTimeConfig?: BuildTimeConfig<FactoryResult, TraitName, Result, InitialParameters>,
    ): Result[];
}

export type IteratorsConfiguration<T> = {[Key in keyof T]: IteratorsConfiguration<T[Key]> | Iterator<T[Key]>};

export type FreezeKeys<T> = {
    [Key in keyof T as Key]: T[Key];
};

export type TraitsConfiguration<FactoryResultType, TraitName extends string = string> = {
    [key in TraitName]: {overrides?: Overrides<FreezeKeys<FactoryResultType>>};
};

export type Mutable<T> = {
    -readonly [Key in keyof T]: T[Key];
};
