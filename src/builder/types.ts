import {FixedFunction} from '../generators/func';

type Function<T> = () => T;

export type FieldGenerator<T> = Function<T> | Iterator<T, T>;

export type FieldType<T, R> = T | FieldsConfiguration<T> | FixedFunction | FieldGenerator<T>;

type Trait = string;

export type Builder<Result> = {
    (buildTimeConfig?: BuildTimeConfig<Result>): Result;
    reset(): void;
    one(buildTimeConfig?: BuildTimeConfig<Result>): Result;
    many(count: number, buildTimeConfig?: BuildTimeConfig<Result>): Result[];
};

export type FieldsConfiguration<Result> = {
    readonly [Key in keyof Result]: FieldType<Result[Key], Result>;
};

export type Overrides<Result = unknown> = {
    [Key in keyof Result]?: FieldType<Result[Key], Result>;
};

export type BuildTimeConfig<Result> = {
    overrides?: Overrides<Result>;
    map?: (builtThing: Result) => Result;
    traits?: string | string[];
};

export type BuilderConfiguration<FactoryResult, PostBuildResult = FactoryResult> = {
    readonly fields: FieldsConfiguration<FactoryResult>;
    readonly traits?: TraitsConfiguration<FactoryResult>;
    readonly postBuild?: (x: FactoryResult) => PostBuildResult;
};

export interface TraitsConfiguration<FactoryResultType> {
    readonly [traitName: string]: {
        overrides?: Overrides<FactoryResultType>;
        // postBuild?: (builtThing: FactoryResultType) => FactoryResultType;
    };
}
