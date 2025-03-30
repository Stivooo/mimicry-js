import {ResetSignal} from './ResetSignal';

interface Resetable<T> {
    val(): Readonly<T>;
    set(updated: T): T;
    use(signal: ResetSignal): ResetSignal;
}

export function resetable<T>(initialValue: T): Resetable<T> {
    let _value = initialValue;
    let resetSignal: ResetSignal | undefined;

    function reset() {
        _value = initialValue;
    }

    return {
        val() {
            return _value;
        },
        set(updatedValue: T) {
            _value = updatedValue;
            return _value;
        },
        use(signal: ResetSignal) {
            if (!signal) {
                throw Error('An instance of `ResetSignal` was not provided!');
            }

            if (resetSignal !== signal) {
                resetSignal = signal;
                resetSignal.listen(reset);
            }

            return resetSignal;
        },
    };
}
