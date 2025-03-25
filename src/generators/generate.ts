import {FieldsConfigurationGeneratorFunction} from '../builder/types';

declare const FieldsGeneratorBrand: unique symbol;

export class FieldsGenerator<FactoryResult, InitialParameters> {
    [FieldsGeneratorBrand]: void;
    generator: FieldsConfigurationGeneratorFunction<FactoryResult, InitialParameters>;

    constructor(generator: FieldsConfigurationGeneratorFunction<FactoryResult, InitialParameters>) {
        this.generator = generator;
    }
}

type ExtractGeneratorResult<T> = T extends (...args: any[]) => Generator<infer R, never>
    ? R
    : T extends (...args: any[]) => Generator<never, infer R>
      ? R
      : never;

type ExtractGeneratorParameters<F> = F extends (...params: void[]) => Generator
    ? never
    : F extends (...args: [...infer P]) => Generator
      ? P
      : never;

type GeneratorFunction = (...args: any[]) => Generator;

export function generate<Gn extends GeneratorFunction>(generator: Gn) {
    type Result = ExtractGeneratorResult<Gn>;
    type Initials = ExtractGeneratorParameters<Gn>;
    type FieldsGeneratorFunction = FieldsConfigurationGeneratorFunction<Result, Initials>;
    type FieldsGeneratorAlias = FieldsGenerator<Result, Initials>;

    return new FieldsGenerator(generator as FieldsGeneratorFunction) as FieldsGeneratorAlias;
}

export function isFieldsGenerator<G extends FieldsGenerator<any, any>>(value: unknown): value is G {
    return value instanceof FieldsGenerator;
}
