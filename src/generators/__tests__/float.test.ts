import {seed} from '../../random/random';
import {float} from '../float';

describe('float()', () => {
    it('returns float between 0 and 1 by default', () => {
        const value = float();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
    });

    it('returns float between 0 and max when one argument is provided', () => {
        const value = float(10);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(10);
    });

    it('returns float between min and max when two arguments are provided', () => {
        const value = float(5, 10);
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThanOrEqual(10);
    });

    it('swaps min and max if min > max', () => {
        const value = float(10, 5);
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThanOrEqual(10);
    });

    it('produces deterministic values when seeded', () => {
        seed(123);
        const value1 = float(1, 2);

        seed(123);
        const value2 = float(1, 2);

        expect(value1).toBe(value2);
    });
});
