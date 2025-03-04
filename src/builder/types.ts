import {FixedFunction} from '../generators/func';

type Function<T> = () => T;

export type FieldGenerator<T> = Function<T> | Iterator<T, T>;

export type FieldType<T> = T | FixedFunction | FieldGenerator<T>;

type Trait = string;

export type Builder<Result, MappedResult = Result> = {
    (buildTimeConfig?: BuildTimeConfig<Result, MappedResult>): MappedResult;
    one<MappedResult = Result>(buildTimeConfig?: BuildTimeConfig<Result, MappedResult>): MappedResult;
    many<MappedResult = Result>(count: number, buildTimeConfig?: BuildTimeConfig<Result, MappedResult>): MappedResult[];
    use<
        ParentalBuilderResult,
        InheritorBuilderResult extends {
            [K in keyof (Omit<MappedResult, keyof ParentalBuilderResult> & ParentalBuilderResult)]: (Omit<
                MappedResult,
                keyof ParentalBuilderResult
            > &
                ParentalBuilderResult)[K];
        },
    >(
        parentBuilder: Builder<ParentalBuilderResult>,
    ): Builder<InheritorBuilderResult>;
};

export type FieldsConfiguration<Result> = {
    readonly [Key in keyof Result]: FieldType<Result[Key]>;
};

export type Overrides<Result = unknown> = {
    [Key in keyof Result]?: FieldType<Result[Key]>;
};

export type BuildTimeConfig<Result, MappedResult = Result> = {
    overrides?: Overrides<Result>;
    postBuild?: (builtThing: Result) => MappedResult;
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
        postBuild?: (builtThing: FactoryResultType) => FactoryResultType; // todo tests
    };
}
