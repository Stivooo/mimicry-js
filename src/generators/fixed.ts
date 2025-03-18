declare const FixedValueBrand: unique symbol;

export class FixedValue<V> {
    [FixedValueBrand]: void;
    value: V;

    constructor(fn: V) {
        this.value = fn;
    }
}

export function fixed<V>(fn: V) {
    return new FixedValue<V>(fn);
}

export function isFixedValue<T>(value: any): value is FixedValue<T> {
    return value instanceof FixedValue;
}
