import {ResetSignal} from '../reset/ResetSignal';
import {resetable} from '../reset/resetable';

export function sequence(): Generator<number, never, ResetSignal>;
export function sequence<T>(providedFunction: (counter: number) => T): Generator<T, never, ResetSignal>;
export function* sequence<T>(providedFunction?: (counter: number) => T): Generator<T, never, ResetSignal> {
    const {val, set, use} = resetable(0);

    while (true) {
        use(yield providedFunction ? providedFunction(set(val() + 1)) : (set(val() + 1) as T));
    }
}
