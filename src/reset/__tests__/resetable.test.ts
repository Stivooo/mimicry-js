import {resetable} from '../resetable';
import {ResetableSignal} from '../ResetableSignal';
import {ResetSignal} from '../ResetSignal';

describe('Reset iterators', () => {
    it('should reset value using ResetSignal', () => {
        function* generator() {
            let counter = 0;

            while (true) {
                const signal: ResetSignal = yield ++counter;
                signal.listen(() => {
                    counter = 0;
                });
            }
        }

        const resetSignal = new ResetableSignal();
        const iterator = generator();

        const firstSet = new Array(3).fill(0).map(() => iterator.next(resetSignal).value);
        expect(firstSet).toEqual([1, 2, 3]);

        resetSignal.reset();

        const secondSet = new Array(3).fill(0).map(() => iterator.next(resetSignal).value);
        expect(secondSet).toEqual([1, 2, 3]);
    });

    it('should reset value using ResetSignal with resetable', () => {
        function* generator() {
            const {val, set, use} = resetable(0);

            while (true) {
                use(yield set(val() + 1));
            }
        }

        const resetSignal = new ResetableSignal();
        const iterator = generator();

        const firstSet = new Array(3).fill(0).map(() => iterator.next(resetSignal).value);
        expect(firstSet).toEqual([1, 2, 3]);

        resetSignal.reset();

        const secondSet = new Array(3).fill(0).map(() => iterator.next(resetSignal).value);
        expect(secondSet).toEqual([1, 2, 3]);
    });

    it('should reset object value', () => {
        function* generator() {
            const {val, set, use} = resetable({counter: 0});

            while (true) {
                use(
                    yield set({
                        counter: val().counter + 1,
                    }),
                );
            }
        }

        const resetSignal = new ResetableSignal();
        const iterator = generator();

        const firstSet = new Array(3).fill(0).map(() => iterator.next(resetSignal).value);
        expect(firstSet).toEqual([{counter: 1}, {counter: 2}, {counter: 3}]);

        resetSignal.reset();

        const secondSet = new Array(3).fill(0).map(() => iterator.next(resetSignal).value);
        expect(secondSet).toEqual([{counter: 1}, {counter: 2}, {counter: 3}]);
    });

    it('should add the subscriber only once for each generator', () => {
        function* sequence() {
            const {val, set, use} = resetable(0);

            while (true) {
                use(yield set(val() + 1));
            }
        }

        function* exponent(value: number) {
            const {val, set, use} = resetable(1);

            while (true) {
                use(yield set(val() * value));
            }
        }

        const resetSignal = new ResetableSignal();

        const firstIterator = sequence();
        expect(new Array(3).fill(0).map(() => firstIterator.next(resetSignal).value)).toEqual([1, 2, 3]);

        const secondIterator = exponent(2);
        expect(new Array(3).fill(0).map(() => secondIterator.next(resetSignal).value)).toEqual([2, 4, 8]);

        expect(resetSignal.listenersCount).toBe(2);
    });

    it('should use two resetable', () => {
        function* fibonacciSequence() {
            const {val: valA, set: setA, use: useA} = resetable(0);
            const {val: valB, set: setB, use: useB} = resetable(1);

            while (true) {
                const a = valA();
                const b = valB();
                setA(b);
                setB(a + b);
                useB(useA(yield a));
            }
        }

        const resetSignal = new ResetableSignal();
        const fibonacci = fibonacciSequence();

        const iterate = <T>(times: number, fn: () => T) =>
            Array(times)
                .fill(0)
                .map(() => fn());

        expect(iterate(7, () => fibonacci.next(resetSignal).value)).toEqual([0, 1, 1, 2, 3, 5, 8]);

        resetSignal.reset();
        expect(iterate(7, () => fibonacci.next(resetSignal).value)).toEqual([0, 1, 1, 2, 3, 5, 8]);

        resetSignal.reset();
        expect(iterate(7, () => fibonacci.next(resetSignal).value)).toEqual([0, 1, 1, 2, 3, 5, 8]);
    });
});
