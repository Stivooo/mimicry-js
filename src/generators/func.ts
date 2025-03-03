type Function = (...args: any[]) => any;

declare const FixedFunctionBrand: unique symbol;

export class FixedFunction<F extends Function = Function> {
    [FixedFunctionBrand]: void;
    call: F;

    constructor(fn: F) {
        this.call = fn;
    }
}

export function func<F extends Function>(fn: F): FixedFunction<F> {
    return new FixedFunction<F>(fn);
}

export function isFixedFunction<T extends Function = Function>(value: any): value is FixedFunction<T> {
    return value instanceof FixedFunction;
}
