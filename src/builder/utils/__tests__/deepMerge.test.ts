import {deepMerge} from '../deepMerge'; // Adjust the import path if needed

describe('deepMerge', () => {
    it('should merges two simple objects', () => {
        const obj1 = {a: 1, b: 2};
        const obj2 = {b: 3, c: 4};
        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({a: 1, b: 3, c: 4});
    });

    it('should performs deep merging of nested objects', () => {
        const obj1 = {nested: {x: 10, y: 20}};
        const obj2 = {nested: {y: 99, z: 30}};
        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({nested: {x: 10, y: 99, z: 30}});
    });

    it('should does not mutate the original objects', () => {
        const obj1 = {a: 1};
        const obj2 = {b: 2};
        const copyObj1 = {...obj1};

        deepMerge(obj1, obj2);

        expect(obj1).toEqual(copyObj1);
    });

    it('should creates a new merged object instead of modifying input objects', () => {
        const obj1 = {nested: {a: 1}};
        const obj2 = {nested: {b: 2}};

        const result = deepMerge(obj1, obj2);
        result.nested.a = 999;

        expect(obj1.nested.a).toBe(1);
    });

    it('should handles non-object values correctly', () => {
        const obj1 = {a: 1, b: {x: 10}};
        const obj2 = {b: null, c: 3};

        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({a: 1, b: null, c: 3});
    });

    it('should treats arrays as primitive values (does not merge them)', () => {
        const obj1 = {arr: [1, 2, 3]};
        const obj2 = {arr: [4, 5, 6]};

        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({arr: [4, 5, 6]});
    });

    it('should treats classes as primitive values (does not merge them)', () => {
        class A {
            public name = 'A';
            public attribute = 5;
        }

        class B {
            public name = 'B';
        }

        const obj1 = {instance: new A()};
        const obj2 = {instance: new B()};

        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({instance: new B()});
        expect(result.instance.name).toBe('B');
        expect(result.instance.attribute).toBeUndefined();
    });

    it('should does not merge non-plain objects like Map and Set', () => {
        const obj1 = {map: new Map([[1, 'one']]), set: new Set([1, 2, 3])};
        const obj2 = {map: new Map([[2, 'two']]), set: new Set([4, 5, 6])};

        const result = deepMerge(obj1, obj2);

        expect(result.map).toBeInstanceOf(Map);
        expect(result.set).toBeInstanceOf(Set);
        expect(Array.from(result.map.entries())).toEqual([[2, 'two']]);
        expect(Array.from(result.set.values())).toEqual([4, 5, 6]);
    });
});
