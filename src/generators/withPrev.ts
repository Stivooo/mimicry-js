type FunctionWithPreviousValue<T> = (prev?: T) => T;

export function withPrev<V>(fn: FunctionWithPreviousValue<V>) {
    function* generator() {
        let prev: V | undefined = undefined;

        while (true) {
            prev = fn(prev);
            yield prev;
        }
    }

    return generator() as Generator<V, V>;
}
