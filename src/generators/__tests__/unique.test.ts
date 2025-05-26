import {unique} from '../unique';
import {seed} from '../../random/random';
import {ResetableSignal} from '../../reset/ResetableSignal';

describe('unique generator', () => {
    it('returns all unique values without repetition', () => {
        const signal = new ResetableSignal();
        const gen = unique('a', 'b', 'c', 'd', 'e');

        const result = [
            gen.next(signal).value,
            gen.next(signal).value,
            gen.next(signal).value,
            gen.next(signal).value,
            gen.next(signal).value,
        ];

        expect(result.sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('returns determined unique values', () => {
        const signal = new ResetableSignal();
        const gen = unique('a', 'b', 'c', 'd', 'e');

        seed(42);

        const result = [
            gen.next(signal).value,
            gen.next(signal).value,
            gen.next(signal).value,
            gen.next(signal).value,
            gen.next(signal).value,
        ];

        expect(result).toEqual(['a', 'd', 'e', 'c', 'b']);
    });

    it('throws an error when no unique options are left', () => {
        const signal = new ResetableSignal();

        const gen = unique('x');
        gen.next();

        expect(() => gen.next(signal)).toThrow('No unique options left!');
    });

    it('resets internal state after reset signal', () => {
        const signal = new ResetableSignal();
        seed(42);

        const gen = unique('x', 'y');
        expect(gen.next(signal).value).toBeDefined();
        expect(gen.next(signal).value).toBeDefined();

        signal.reset();

        expect(gen.next(signal).value).toBeDefined();
        expect(gen.next(signal).value).toBeDefined();
    });

    it('is deterministic with same seed and input', () => {
        const signal = new ResetableSignal();

        seed(111);
        const gen1 = unique(1, 2, 3);
        const out1 = [gen1.next(signal).value, gen1.next(signal).value, gen1.next(signal).value];

        seed(111);
        const gen2 = unique(1, 2, 3);
        const out2 = [gen2.next(signal).value, gen2.next(signal).value, gen2.next(signal).value];

        expect(out1).toEqual(out2);
    });

    it('accepts array input form', () => {
        const signal = new ResetableSignal();

        seed(5);
        const gen = unique(['a', 'b', 'c']);
        const values = [gen.next(signal).value, gen.next(signal).value, gen.next(signal).value];

        expect(values.sort()).toEqual(['a', 'b', 'c']);
    });

    it('works with objects and returns references', () => {
        const signal = new ResetableSignal();

        const a = {id: 1};
        const b = {id: 2};
        const gen = unique(a, b);

        const first = gen.next(signal).value;
        const second = gen.next(signal).value;

        expect([a, b]).toContain(first);
        expect([a, b]).toContain(second);
        expect(first).not.toBe(second);
    });
});
