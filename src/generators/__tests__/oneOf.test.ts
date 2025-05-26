import {seed} from '../../random/random';
import {oneOf} from '../oneOf';

function* sequence(length: number) {
    let curr = 1;

    while (curr < length) {
        yield curr++;
    }
}

describe('oneOf generator', () => {
    afterAll(() => {
        seed();
    });

    it('returns values only from the given array', () => {
        seed(42);
        const gen = oneOf(['apple', 'banana', 'cherry']);

        for (let i = 0; i < 50; i++) {
            const {value} = gen.next();
            expect(['apple', 'banana', 'cherry']).toContain(value);
        }
    });

    it('is deterministic with the same seed', () => {
        seed(123);
        const gen1 = oneOf(new Array(...sequence(100)));
        const result1 = new Array(100).fill(0).map(() => gen1.next());

        seed(123);
        const gen2 = oneOf(new Array(...sequence(100)));
        const result2 = new Array(100).fill(0).map(() => gen2.next());

        expect(result1).toEqual(result2);
    });

    it('handles a single element array', () => {
        const gen = oneOf(['single']);
        for (let i = 0; i < 10; i++) {
            expect(gen.next().value).toBe('single');
        }
    });

    it('correctly merges first param and rest params', () => {
        const gen = oneOf('a', 'b', 'c', 'd');
        const values = ['a', 'b', 'c', 'd'];
        for (let i = 0; i < 20; i++) {
            expect(values).toContain(gen.next().value);
        }
    });

    it('produces full range over time (with enough iterations)', () => {
        seed(999);
        const gen = oneOf(1, 2, 3);
        const seen = new Set<number>();

        for (let i = 0; i < 100; i++) {
            seen.add(gen.next().value);
        }

        expect(seen).toEqual(new Set([1, 2, 3]));
    });
});
