import {MersenneTwister} from '../MersenneTwister';

describe('MersenneTwister', () => {
    it('produces the same sequence for the same seed', () => {
        const seed = Math.floor(Math.random() * 100);
        const gen1 = new MersenneTwister(seed);
        const gen2 = new MersenneTwister(seed);

        for (let i = 0; i < 1000; i++) {
            expect(gen1.random()).toBe(gen2.random());
        }
    });

    it('produces different sequences for different seeds', () => {
        const gen1 = new MersenneTwister(1);
        const gen2 = new MersenneTwister(2);

        let mismatchFound = false;
        for (let i = 0; i < 1000; i++) {
            if (gen1.random() !== gen2.random()) {
                mismatchFound = true;
                break;
            }
        }

        expect(mismatchFound).toBe(true);
    });

    it('produces numbers in [0, 1]', () => {
        const gen = new MersenneTwister(0);
        for (let i = 0; i < 1000; i++) {
            const r = gen.random();
            expect(r).toBeGreaterThanOrEqual(0);
            expect(r).toBeLessThan(1);
        }
    });
});
