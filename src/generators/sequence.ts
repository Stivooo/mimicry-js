export function sequence(): Generator<number, never, never>;
export function sequence<T>(providedFunction: (counter: number) => T): Generator<T, never, never>;
export function* sequence<T>(providedFunction?: (counter: number) => T): Generator<T, never, never> {
    let counter = 0;

    while (true) {
        yield providedFunction ? providedFunction(counter) : (counter as T);
        counter++;
    }
}
