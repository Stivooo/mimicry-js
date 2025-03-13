declare const FixedValueBrand: unique symbol;

export class FixedValue<F> {
    [FixedValueBrand]: void;
    value: F;

    constructor(fn: F) {
        this.value = fn;
    }
}

export function fixed<F>(fn: F) {
    return new FixedValue<F>(fn);
}

export function isFixedValue<T>(value: any): value is FixedValue<T> {
    return value instanceof FixedValue;
}
