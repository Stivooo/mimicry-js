import {FieldsConfigurationGeneratorFunction} from '../builder/types';

declare const FieldsGeneratorBrand: unique symbol;

export class FieldsGenerator<FactoryResult, InitialParameters extends any[]> {
    [FieldsGeneratorBrand]: void;
    generator: FieldsConfigurationGeneratorFunction<FactoryResult, InitialParameters>;

    constructor(generator: FieldsConfigurationGeneratorFunction<FactoryResult, InitialParameters>) {
        this.generator = generator;
    }
}

type ExtractGeneratorResult<T> = T extends (...args: any[]) => Generator<infer R, never> ? R : never;

type ExtractGeneratorParameters<F> = F extends (...args: void[]) => Generator
    ? never
    : F extends (...args: [...infer P]) => Generator
      ? P
      : never;

type GeneratorFunction = (...args: any[]) => Generator;

export function generate<Gn extends GeneratorFunction>(generator: Gn) {
    type Result = ExtractGeneratorResult<Gn>;
    type Parameters = ExtractGeneratorParameters<Gn>;
    type FieldsGeneratorFunction = FieldsConfigurationGeneratorFunction<Result, Parameters>;
    type FieldsGeneratorAlias = FieldsGenerator<Result, Parameters>;

    return new FieldsGenerator(generator as FieldsGeneratorFunction) as FieldsGeneratorAlias;
}

export function isFieldsGenerator<G extends FieldsGenerator<any, any>>(value: unknown): value is G {
    return value instanceof FieldsGenerator;
}
