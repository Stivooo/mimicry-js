import {seed, random} from '../random';

describe('random()', () => {
    it('produces repeatable sequence with the same seed', () => {
        seed(42);
        const values1 = [random(), random(), random(), random(), random()];

        seed(42);
        const values2 = [random(), random(), random(), random(), random()];

        expect(values1).toEqual(values2);
    });

    it('returns number in [0, 1]', () => {
        seed(1);
        for (let i = 0; i < 100; i++) {
            const r = random();
            expect(r).toBeGreaterThanOrEqual(0);
            expect(r).toBeLessThan(1);
        }
    });
});
