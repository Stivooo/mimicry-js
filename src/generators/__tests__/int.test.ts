import {seed} from '../../random/random';
import {int} from '../int';

describe('int()', () => {
    it('returns number in default range [1, 1000] with no args', () => {
        seed(1);
        for (let i = 0; i < 100; i++) {
            const n = int();
            expect(n).toBeGreaterThanOrEqual(1);
            expect(n).toBeLessThanOrEqual(1000);
        }
    });

    it('returns number in range [0, max] when called with one arg', () => {
        seed(2);
        for (let i = 0; i < 100; i++) {
            const n = int(5);
            expect(n).toBeGreaterThanOrEqual(0);
            expect(n).toBeLessThanOrEqual(5);
        }
    });

    it('returns number in range [min, max] when called with two args', () => {
        seed(3);
        for (let i = 0; i < 100; i++) {
            const n = int(10, 20);
            expect(n).toBeGreaterThanOrEqual(10);
            expect(n).toBeLessThanOrEqual(20);
        }
    });

    it('swaps min and max if min > max', () => {
        seed(4);
        for (let i = 0; i < 100; i++) {
            const n = int(20, 10);
            expect(n).toBeGreaterThanOrEqual(10);
            expect(n).toBeLessThanOrEqual(20);
        }
    });

    it('throws if inputs are not integers', () => {
        expect(() => int(1.5, 3)).toThrow();
        expect(() => int(1, 3.7)).toThrow();
        expect(() => int(NaN, 2)).toThrow();
    });

    it('is deterministic with the same seed', () => {
        seed(42);
        const a = [int(), int(5), int(1, 3)];

        seed(42);
        const b = [int(), int(5), int(1, 3)];

        expect(a).toEqual(b);
    });
});
