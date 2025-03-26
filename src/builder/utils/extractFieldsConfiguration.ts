import {
    BuilderConfigurationFields,
    FieldsConfiguration,
    FieldsConfigurationFunction,
    FieldsConfigurationGeneratorFunction,
} from '../types';
import {isPlainObject} from '../typeCheckers/isPlainObject';
import {isFieldsGenerator} from '../../generators/generate';
import {isFunction} from '../typeCheckers/isFunction';

export const extractFieldsConfiguration = <Origin, InitialParameters extends any[] = never>(
    fields: BuilderConfigurationFields<Origin, InitialParameters>,
): {
    originFields: FieldsConfiguration<Origin>;
    originFieldsFunction: FieldsConfigurationFunction<Origin> | null;
    originFieldsGenerator: FieldsConfigurationGeneratorFunction<Origin, InitialParameters> | null;
} => {
    const isGenerator = isFieldsGenerator(fields);
    const isObject = isPlainObject<FieldsConfiguration<Origin>>(fields);
    const isPlainFunction = isFunction(fields);

    return {
        originFields: isObject ? fields : ({} as FieldsConfiguration<Origin>),
        originFieldsFunction: isPlainFunction ? fields : null,
        originFieldsGenerator: isGenerator ? fields.generator : null,
    };
};
