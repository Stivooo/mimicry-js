import type {FixedValue} from '../generators/fixed';
import type {FieldsGenerator} from '../generators/generate';
import {ResetSignal} from '../reset/ResetSignal';

export type FunctionalGenerator<T> = () => T;

export type FieldGenerator<T> = FunctionalGenerator<T> | Iterator<T, never | void, ResetSignal>;

export type FieldType<T> = T | FixedValue<T> | FieldGenerator<T> | FieldsConfiguration<T>;

export type FieldsConfiguration<Origin> = {
    readonly [Key in keyof Origin]: FieldType<Origin[Key]>;
};

export type FieldsConfigurationFunction<Origin> = (prevBuild?: Origin) => FieldsConfiguration<Origin>;

export type FieldsConfigurationGenerator<Origin> = Generator<
    FieldsConfiguration<Origin>,
    never | void,
    Origin | undefined
>;

export type FieldsConfigurationGeneratorFunction<Origin, InitialParameters extends any[] = never> = (
    ...initialParameters: InitialParameters
) => FieldsConfigurationGenerator<Origin>;

export type BuilderConfigurationFields<Origin, InitialParameters extends any[] = never> =
    | FieldsConfiguration<Origin>
    | FieldsConfigurationFunction<Origin>
    | FieldsGenerator<Origin, InitialParameters>;

export type BuilderConfiguration<
    Origin,
    PostBuildResult = Origin,
    TraitName extends string = string,
    InitialParameters extends any[] = never,
> = {
    readonly fields: BuilderConfigurationFields<Origin, InitialParameters>;
    readonly traits?: TraitsConfiguration<Origin, TraitName>;
    readonly postBuild?: (x: Origin) => PostBuildResult;
};

export type Overrides<Result> = {
    [Key in keyof Result]?: FieldType<Result[Key]> | Overrides<Result[Key]>;
};

export type BuildTimeConfig<
    Origin,
    StaticPostBuildResult = Origin,
    PostBuildResult = StaticPostBuildResult,
    TraitName = string,
    InitialParameters extends any[] = never,
> = {
    overrides?: Overrides<Origin>;
    postBuild?: (builtThing: StaticPostBuildResult) => PostBuildResult;
    traits?: TraitName | TraitName[];
    initialParameters?: InitialParameters;
};

export interface Builder<
    Origin,
    PostBuildResult = Origin,
    TraitName extends string = string,
    InitialParameters extends any[] = never,
> {
    one<Result = PostBuildResult>(
        buildTimeConfig?: BuildTimeConfig<Origin, PostBuildResult, Result, TraitName, InitialParameters>,
    ): Result;
    many<Result = PostBuildResult>(
        count: number,
        buildTimeConfig?: BuildTimeConfig<Origin, PostBuildResult, Result, TraitName, InitialParameters>,
    ): Result[];
    reset(): void;
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
