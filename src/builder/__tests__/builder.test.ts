import {build} from '../builder';
import {sequence} from '../../generators/sequence';
import {oneOf} from '../../generators/oneOf';
import {fixed} from '../../generators/fixed';
import {withPrev} from '../../generators/withPrev';
import {bool} from '../../generators/bool';
import {unique} from '../../generators/unique';
import {generate} from '../../generators/generate';
import {FieldsConfiguration} from '../types';

interface IProfileData {
    firstName: string;
    lastName: string;
    age?: number;
}

class Profile {
    name: string;
    age?: number;

    constructor({firstName, lastName, age}: IProfileData) {
        this.name = `${firstName} ${lastName}`;
        this.age = age;
    }
}

describe('builder checks:', () => {
    describe('plain builders with primitives', () => {
        it('should build by fields configuration', () => {
            const profile = {
                firstName: 'John',
                age: 30,
            };

            const builder = build<IProfileData>({
                fields: {...profile, lastName: 'Doe'},
            });

            const double = {...profile, lastName: 'Doe'};
            expect(builder.one()).toEqual(double);
            expect(builder.many(2)).toEqual([double, double]);
        });

        it('should build by fields configuration with postBuild processing', () => {
            const profile = {
                firstName: 'John',
                lastName: 'Doe',
                age: 30,
            };

            const builder = build<IProfileData, Profile>({
                fields: profile,
                postBuild: (generatedFields) => new Profile(generatedFields),
            });

            const double = new Profile(profile);
            expect(builder.one()).toBeInstanceOf(Profile);
            expect(builder.many(2)).toEqual([double, double]);
        });

        it('should build by fields configuration with build time postBuild processing', () => {
            const builder = build({
                fields: {
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 30,
                },
            });

            const profile = builder.one({
                overrides: {
                    age: 50,
                },
                postBuild: (generatedFields) => new Profile(generatedFields),
            });

            expect(profile).toBeInstanceOf(Profile);
            expect(profile.age).toBe(50);
        });
    });

    describe('builders with functional fields generator', () => {
        it('should build by using previous build', () => {
            type Unit = {
                name: string;
                value: number;
            };

            const builder = build<Unit>({
                fields: (prevBuild) => {
                    const value = prevBuild?.value ?? 1;
                    return {
                        name: 'X',
                        value: value * 10,
                    };
                },
            });

            expect(builder.many(3)).toEqual([
                {name: 'X', value: 10},
                {name: 'X', value: 100},
                {name: 'X', value: 1000},
            ]);
        });

        it('should build by using previous build with traits and postBuild', () => {
            type TUnit = {
                name: string;
                value: number;
            };

            class Unit {
                constructor(
                    public name: string,
                    public value: number,
                ) {}
            }

            const builder = build({
                fields: (prevBuild) => {
                    const value = prevBuild?.value ?? 1;
                    return {
                        name: 'X',
                        value: value * 10,
                    };
                },
                traits: {
                    Y: {
                        overrides: {
                            name: 'Y',
                        },
                    },
                },
                postBuild: (generatedFields: TUnit) => new Unit(generatedFields.name, generatedFields.value),
            });

            expect(builder.many(3, {traits: 'Y'})).toEqual([
                new Unit('Y', 10),
                new Unit('Y', 100),
                new Unit('Y', 1000),
            ]);
        });

        it('should build by using previous build with nested generators', () => {
            type Unit = {
                id: number;
                name: string;
                value: number;
                position: {
                    x: number;
                    y: number;
                };
            };

            const builder = build({
                fields: (prevBuild?: Unit) => {
                    const value = prevBuild?.value ?? 1;
                    return {
                        id: sequence(),
                        name: 'X',
                        value: value * 10,
                        position: {
                            x: unique(10, 20, 30),
                            y: unique(40, 50, 60),
                        },
                    };
                },
            });

            expect(builder.many(3)).toEqual([
                {id: 0, name: 'X', value: 10, position: {x: 10, y: 40}},
                {id: 1, name: 'X', value: 100, position: {x: 20, y: 50}},
                {id: 2, name: 'X', value: 1000, position: {x: 30, y: 60}},
            ]);
        });
    });

    describe('traits checks', () => {
        it('should build by fields configuration with one trait modification', () => {
            const profile = {
                firstName: 'John',
                lastName: 'Doe',
                age: 30,
            };

            const builder = build({
                fields: profile,
                traits: {
                    smith: {
                        overrides: {
                            lastName: 'Smith',
                            age: 40,
                        },
                    },
                },
            });

            const double = {firstName: 'John', lastName: 'Smith', age: 40};
            expect(
                builder.one({
                    traits: 'smith',
                }),
            ).toEqual(double);
            expect(builder.many(2, {traits: 'smith'})).toEqual([double, double]);
        });

        it('should build by fields configuration with one trait modification and postBuild processing', () => {
            const profile = {
                firstName: 'John',
                lastName: 'Doe',
                age: 30,
            };

            const builder = build({
                fields: profile,
                traits: {
                    smith: {
                        overrides: {
                            lastName: 'Smith',
                            age: 40,
                        },
                    },
                },
                postBuild: (generatedFields) => new Profile(generatedFields),
            });

            const double = new Profile({firstName: 'John', lastName: 'Smith', age: 40});
            expect(
                builder.one({
                    traits: 'smith',
                }),
            ).toEqual(double);
            expect(builder.many(2, {traits: 'smith'})).toEqual([double, double]);
        });

        it('should build by fields configuration with two traits modifications', () => {
            const profile = {
                firstName: 'John',
                lastName: 'Doe',
                age: 30,
            };

            const builder = build({
                fields: profile,
                traits: {
                    smith: {
                        overrides: {
                            lastName: 'Smith',
                            age: 40,
                        },
                    },
                    younger: {
                        overrides: {
                            age: 20,
                        },
                    },
                },
            });

            const double = {firstName: 'John', lastName: 'Smith', age: 20};
            expect(
                builder.one({
                    traits: ['smith', 'younger'],
                }),
            ).toEqual(double);
            expect(builder.many(2, {traits: ['smith', 'younger']})).toEqual([double, double]);
        });

        it('should fill skipped unnecessary fields by traits values', () => {
            interface User {
                id: number;
                name: string;
                role: 'customer' | 'support' | 'admin';
                email?: string;
            }

            const userBuilder = build<User>({
                fields: {
                    id: sequence(),
                    name: oneOf('John', 'Andrew', 'Mike'),
                    role: oneOf('customer', 'support', 'admin'),
                },
                traits: {
                    support: {
                        overrides: {
                            role: 'support',
                            email: 'support@example.com',
                        },
                    },
                },
            });

            const supportUser = userBuilder.one({
                overrides: {
                    name: 'John',
                },
                traits: 'support',
            });

            expect(supportUser).toEqual({id: 0, name: 'John', role: 'support', email: 'support@example.com'});
        });
    });

    describe('builders with classes as fields values', () => {
        it('should build by fields configuration with nested class', () => {
            class Book {
                constructor(
                    public title: string,
                    public author: Author,
                ) {}
            }

            class Author {
                constructor(public name: string) {}
            }

            const builder = build({
                fields: {
                    title: 'My Book',
                    author: new Author('John Doe'),
                },
                postBuild: (generatedFields) => new Book(generatedFields.title, generatedFields.author),
            });

            const double = new Book('My Book', new Author('John Doe'));
            expect(builder.one()).toEqual(double);
            expect(builder.one().author).toBeInstanceOf(Author);
            expect(builder.many(2)).toEqual([double, double]);
        });

        it('should build by fields configuration with nested Map', () => {
            class Tag {
                constructor(
                    public id: number,
                    public name: string,
                ) {}
            }

            class Book {
                constructor(
                    public title: string,
                    public tags: Map<number, Tag>,
                ) {}
            }

            const tags = new Map([
                [1, new Tag(1, 'tag1')],
                [2, new Tag(2, 'tag2')],
            ]);

            const builder = build({
                fields: {
                    title: 'My Book',
                    tags,
                },
                postBuild: (generatedFields) => new Book(generatedFields.title, generatedFields.tags),
            });

            const double = new Book('My Book', tags);
            const book = builder.one();
            expect(book).toEqual(double);
            expect(book.tags.size).toBe(2);
            expect(book.tags.get(1)).toBeInstanceOf(Tag);
        });
    });

    describe('builders with complex configuration', () => {
        it('should build by fields configuration with nested tags', () => {
            class Tag {
                constructor(
                    public id: number,
                    public name: string,
                ) {}
            }

            class Book {
                constructor(
                    public title: string,
                    public tags: Tag[],
                ) {}
            }

            const tagBuilder = build({
                fields: {
                    name: 'tag',
                    id: sequence(),
                },
            });

            const builder = build({
                fields: {
                    title: 'My Book',
                    tags: tagBuilder.many(2),
                },
                postBuild: (generatedFields) =>
                    new Book(
                        generatedFields.title,
                        generatedFields.tags.map((tag) => new Tag(tag.id, tag.name)),
                    ),
            });

            const double = new Book('My Book', [new Tag(0, 'tag'), new Tag(1, 'tag')]);
            const book = builder.one();
            expect(book).toEqual(double);
            expect(book.tags.length).toBe(2);
            expect(book.tags[1]).toBeInstanceOf(Tag);
        });

        it('should rebuild result by build time postBuild', () => {
            class Tag {
                constructor(
                    public id: number,
                    public name: string,
                ) {}
            }
            const builder = build({
                fields: {
                    id: sequence(),
                    name: oneOf('Some', 'Another'),
                },
            });

            const double = builder.one({
                overrides: {
                    name: 'Double',
                },
                postBuild: (data) => new Tag(data.id, data.name),
            });

            expect(double).toBeInstanceOf(Tag);
            expect(double.name).toBe('Double');
            expect(double.id).toBe(0);
        });

        it('should build with nested overrides and functional field generator', () => {
            class Book {
                constructor(
                    public id: number,
                    public title: string,
                    public author: Author | null,
                ) {}
            }

            class Author {
                constructor(
                    public id: number,
                    public name: string,
                ) {}
            }

            const builder = build({
                fields: {
                    id: sequence(),
                    title: 'My Book',
                    author: null as null | Author,
                },
                postBuild: (generatedFields) =>
                    new Book(generatedFields.id, generatedFields.title, generatedFields.author),
            });

            const authorBuilder = build({
                fields: {
                    id: 0,
                    name: 'Author',
                },
                postBuild: (generatedFields) => new Author(generatedFields.id, generatedFields.name),
            });

            expect(
                builder.one({
                    overrides: {
                        title: () => 'Another Book',
                        author: () =>
                            authorBuilder.one({
                                overrides: {
                                    id: 1000,
                                    name: 'Charles',
                                },
                            }),
                    },
                }),
            ).toEqual(new Book(0, 'Another Book', new Author(1000, 'Charles')));
        });

        it('should fill skipped unnecessary fields by overrides values', () => {
            interface User {
                id: number;
                name: string;
                role: 'customer' | 'support' | 'admin';
                email?: string;
            }

            const userBuilder = build<User>({
                fields: {
                    id: sequence(),
                    name: oneOf('John', 'Andrew', 'Mike'),
                    role: oneOf('customer', 'support', 'admin'),
                },
            });

            const supportUser = userBuilder.one({
                overrides: {
                    name: 'John',
                    role: 'support',
                    email: 'support@example.com',
                },
            });

            expect(supportUser).toEqual({id: 0, name: 'John', role: 'support', email: 'support@example.com'});
        });

        it('should build by fields configurations with nested array of configurations', () => {
            interface Account {
                id: number;
                name: string;
                addresses: Array<{
                    apartment: string;
                    street: string;
                    city: string;
                    postalCode: number;
                }>;
            }

            const builder = build<Account>({
                fields: {
                    id: sequence(),
                    name: 'John',
                    addresses: [],
                },
            });

            const account = builder.one({
                overrides: {
                    addresses: [
                        {
                            apartment: sequence((x) => x.toString()),
                            street: oneOf('456 Elm Ave'),
                            city: oneOf('Los Angeles'),
                            postalCode: 98101,
                        },
                        {
                            apartment: sequence((x) => x.toString()),
                            street: oneOf('101 Pine Ln'),
                            city: oneOf('San Francisco'),
                            postalCode: 10001,
                        },
                    ],
                },
            });

            expect(account).toEqual({
                id: 0,
                name: 'John',
                addresses: [
                    {
                        apartment: '0',
                        street: '456 Elm Ave',
                        city: 'Los Angeles',
                        postalCode: 98101,
                    },
                    {
                        apartment: '0',
                        street: '101 Pine Ln',
                        city: 'San Francisco',
                        postalCode: 10001,
                    },
                ],
            });
        });
    });

    describe('builders with different values per builds', () => {
        it('should build by fields configuration with functional field creation', () => {
            class Book {
                constructor(
                    public id: number,
                    public title: string,
                    public author: Author,
                ) {}
            }

            class Author {
                constructor(
                    public id: number,
                    public name: string,
                ) {}
            }

            const authorBuilder = build({
                fields: {
                    id: sequence(),
                    name: sequence((counter) => {
                        return `Charles ${counter}`;
                    }),
                },
                postBuild: (generatedFields) => new Author(generatedFields.id, generatedFields.name),
            });

            const builder = build({
                fields: {
                    id: sequence(),
                    title: 'My Book',
                    author: () => authorBuilder.one(),
                },
                postBuild: (generatedFields) =>
                    new Book(generatedFields.id, generatedFields.title, generatedFields.author),
            });

            const double_1 = new Book(0, 'My Book', new Author(0, 'Charles 0'));
            const double_2 = new Book(1, 'My Book', new Author(1, 'Charles 1'));
            const double_3 = new Book(2, 'My Book', new Author(2, 'Charles 2'));
            expect(builder.many(3)).toEqual([double_1, double_2, double_3]);
        });

        it('should correctly use generators with built-time overrides', () => {
            const userBuilder = build({
                fields: {
                    name: 'Sam',
                    createdAt: 1570000000000,
                },
            });

            const users = userBuilder.many(3, {
                overrides: {
                    name: unique('John', 'Andrew', 'Mike'),
                    createdAt: withPrev((prevTimestamp?: number) => {
                        const timestamp = prevTimestamp ?? new Date('2020').getTime();
                        return timestamp + 1000;
                    }),
                },
            });

            expect(users).toHaveLength(3);
            expect(users[0].name).toBe('John');
            expect(users[0].createdAt).toBe(1577836801000);
            expect(users[1].name).toBe('Andrew');
            expect(users[1].createdAt).toBe(1577836802000);
            expect(users[2].name).toBe('Mike');
            expect(users[2].createdAt).toBe(1577836803000);
        });
    });

    describe('builders with nested plain object in configuration', () => {
        type Structure = {
            id: number;
            type: string;
            unit: {
                id: number;
                value: number;
                name: string;
                position: {
                    x: number;
                    y: number;
                };
            };
        };

        it('should build structure with correct traits overrides', () => {
            const builder = build<Structure>({
                fields: {
                    id: sequence(),
                    type: 'Type',
                    unit: {
                        id: sequence(),
                        value: 30,
                        name: 'degree',
                        position: {
                            x: 100,
                            y: 100,
                        },
                    },
                },
                traits: {
                    zeroPoint: {
                        overrides: {
                            unit: {
                                position: {
                                    x: 0,
                                    y: 0,
                                },
                            },
                        },
                    },
                    zeroValue: {
                        overrides: {
                            unit: {
                                value: 0,
                            },
                        },
                    },
                },
            });

            const structure = builder.one({
                traits: ['zeroPoint', 'zeroValue'],
                overrides: {
                    unit: {
                        id: 5,
                    },
                },
            });

            expect(structure).toEqual({
                id: 0,
                type: 'Type',
                unit: {
                    id: 5,
                    value: 0,
                    name: 'degree',
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            });
        });

        it('should build structure with correct overrides', () => {
            const builder = build<Structure>({
                fields: {
                    id: sequence(),
                    type: 'some',
                    unit: {
                        id: sequence(),
                        value: 1,
                        name: 'degree',
                        position: {
                            x: 50,
                            y: 14,
                        },
                    },
                },
            });

            const structures = builder.many(2, {
                overrides: {
                    type: sequence((x) => `Type ${++x}`),
                    unit: {
                        value: unique(5, 10),
                        position: {
                            y: 50,
                        },
                    },
                },
            });

            expect(structures).toEqual([
                {
                    id: 0,
                    type: 'Type 1',
                    unit: {
                        id: 0,
                        value: 5,
                        name: 'degree',
                        position: {
                            x: 50,
                            y: 50,
                        },
                    },
                },
                {
                    id: 1,
                    type: 'Type 2',
                    unit: {
                        id: 1,
                        value: 10,
                        name: 'degree',
                        position: {
                            x: 50,
                            y: 50,
                        },
                    },
                },
            ]);
        });
    });

    describe('builders with Generator fields configurations', () => {
        it('should build by fields configuration Generator without initial parameters', () => {
            const builder = build({
                fields: generate(function* () {
                    let incr = 0;

                    while (true) {
                        yield {
                            result: ++incr,
                        };
                    }
                }),
            });

            const result = builder.many(3);

            expect(result).toEqual([{result: 1}, {result: 2}, {result: 3}]);
        });

        it('should build by fields configuration Generator with few initial parameters', () => {
            const builder = build({
                fields: generate(function* (a: number, b: string, c: boolean = true) {
                    let prev = a;

                    while (true) {
                        prev = prev + a;
                        yield {
                            result: `${b} ${prev} ${c}`,
                        };
                    }
                }),
            });

            const result = builder.many(3, {
                initialParameters: [1, 'result'],
            });

            expect(result).toEqual([{result: 'result 2 true'}, {result: 'result 3 true'}, {result: 'result 4 true'}]);
        });

        it('should init new iterator for each many invoke', () => {
            const builder = build({
                fields: generate(function* (a: number, b: string, c: boolean = true) {
                    let prev = a;

                    while (true) {
                        yield {
                            result: `${b} ${prev} ${c}`,
                        };
                        prev = prev + a;
                    }
                }),
            });

            const firstSet = builder.many(3, {
                initialParameters: [1, 'first'],
            });
            const secondSet = builder.many(3, {
                initialParameters: [1, 'second', false],
            });

            expect(firstSet).toEqual([{result: 'first 1 true'}, {result: 'first 2 true'}, {result: 'first 3 true'}]);
            expect(secondSet).toEqual([
                {result: 'second 1 false'},
                {result: 'second 2 false'},
                {result: 'second 3 false'},
            ]);

            const thirdResult = builder.one({
                initialParameters: [1, 'second'],
            });

            expect(thirdResult).toEqual({result: 'second 1 true'});
        });

        it('should preserve nested iterators between each invoke', () => {
            const builder = build({
                fields: generate(function* () {
                    while (true) {
                        yield {
                            result: sequence(),
                        };
                    }
                }),
            });

            const firstSet = builder.many(3);
            const secondSet = builder.many(3);

            expect(firstSet).toEqual([{result: 0}, {result: 1}, {result: 2}]);
            expect(secondSet).toEqual([{result: 3}, {result: 4}, {result: 5}]);
        });

        it('should build by fields configuration Generator with initial object', () => {
            const builder = build({
                fields: generate(function* (initialValues: {a: number; b: string}) {
                    const {a = 0, b = ''} = initialValues ?? {};
                    let prev = a;

                    while (true) {
                        prev = prev + a;
                        yield {
                            result: `${b} ${prev}`,
                        };
                    }
                }),
            });

            const result = builder.many(3, {
                initialParameters: [
                    {
                        a: 1,
                        b: 'result',
                    },
                ],
            });

            expect(result).toEqual([{result: 'result 2'}, {result: 'result 3'}, {result: 'result 4'}]);
        });

        it('should has access to previous build result', () => {
            type Result = {
                result: number;
            };

            const builder = build({
                fields: generate(function* (a: string = '') {
                    let incr = 1;

                    while (true) {
                        const prev: Result = yield {
                            result: incr,
                        };

                        incr = prev ? prev.result + 1 : 0;
                    }
                }),
            });

            const result = builder.many(3);

            expect(result).toEqual([{result: 1}, {result: 2}, {result: 3}]);
        });

        it('should build by fields configuration Generator with nested fields generators', () => {
            type Structure = {
                result: number;
                attrs: {
                    name: string;
                };
            };

            const builder = build({
                fields: generate(function* (incr: number) {
                    while (true) {
                        const structure: FieldsConfiguration<Structure> = {
                            result: sequence((x) => x + incr),
                            attrs: {
                                name: unique('A', 'B', 'C'),
                            },
                        };
                        yield structure;
                    }
                }),
            });

            const result = builder.many(3, {
                initialParameters: [1],
            });

            expect(result).toEqual([
                {result: 1, attrs: {name: 'A'}},
                {result: 2, attrs: {name: 'B'}},
                {result: 3, attrs: {name: 'C'}},
            ]);
        });

        it('should build by fields configuration Generator with overrides', () => {
            const builder = build({
                fields: generate(function* () {
                    let incr = 0;

                    while (true) {
                        yield {
                            name: oneOf('A', 'B', 'C'),
                            result: ++incr,
                        };
                    }
                }),
            });

            const result = builder.many(3, {
                overrides: {
                    name: 'D',
                },
            });

            expect(result).toEqual([
                {result: 1, name: 'D'},
                {result: 2, name: 'D'},
                {result: 3, name: 'D'},
            ]);
        });

        it('should build by fields configuration Generator with traits', () => {
            const builder = build({
                fields: generate(function* (a: number = 0) {
                    let incr = 0;

                    while (true) {
                        yield {
                            name: oneOf('A', 'B', 'C'),
                            result: ++incr,
                        };
                    }
                }),
                traits: {
                    D: {
                        overrides: {
                            name: 'D',
                        },
                    },
                },
            });

            const result = builder.many(3, {
                traits: 'D',
            });

            expect(result).toEqual([
                {result: 1, name: 'D'},
                {result: 2, name: 'D'},
                {result: 3, name: 'D'},
            ]);
        });
    });

    describe('fixedValue generator checks', () => {
        it('should keep function field with fixedValue decorator', () => {
            const builder = build({
                fields: {
                    id: sequence(),
                    name: () => 'Name',
                    age: 32,
                    getType: fixed(() => 'Some'),
                },
            });
            const double = builder.one();
            expect(double.id).toBe(0);
            expect(double.name).toBe('Name');
            expect(double.getType).toBeInstanceOf(Function);
            expect(double.getType()).toBe('Some');
        });
    });

    describe('custom generator checks', () => {
        it('should build by custom generator', () => {
            function* exponentiation(initialValue = 0) {
                let exponent = 1;

                while (true) {
                    yield initialValue ** exponent;
                    exponent++;
                }
            }

            const builder = build({
                fields: {
                    exponent: exponentiation(2),
                },
            });

            const [first, second, third] = builder.many(3);

            expect(first.exponent).toBe(2);
            expect(second.exponent).toBe(4);
            expect(third.exponent).toBe(8);
        });
    });

    describe('withPrev generator checks', () => {
        it('should build with previous value', () => {
            const builder = build({
                fields: {
                    exponent: withPrev((counter: number = 1) => {
                        return counter * 10;
                    }),
                },
            });

            const [first, second, third] = builder.many(3);

            expect(first.exponent).toBe(10);
            expect(second.exponent).toBe(100);
            expect(third.exponent).toBe(1000);
        });
    });

    describe('bool generator checks', () => {
        it('should build with bool value', () => {
            const builder = build({
                fields: {
                    deleted: bool(),
                },
            });

            expect([true, false]).toContain(builder.one().deleted);
        });
    });

    describe('unique generator checks', () => {
        it('should build with unique values', () => {
            const builder = build({
                fields: {
                    firstName: unique(['John', 'Andrew', 'Mike']),
                    lastName: 'Doe',
                },
            });

            const profiles = builder.many(3);

            expect(profiles.length).toBe(3);

            expect(profiles[0].firstName).toBe('John');
            expect(profiles[1].firstName).toBe('Andrew');
            expect(profiles[2].firstName).toBe('Mike');

            expect(() => builder.one()).toThrow('No unique options left!');
        });
    });

    it('should ', () => {
        function* timePeriodsGenerator(currentStartDate: Date, periodDurationInMs: number) {
            let currentStart = currentStartDate.getTime();

            while (true) {
                const currentEnd = currentStart + periodDurationInMs;
                yield {
                    id: sequence(),
                    start: new Date(currentStart),
                    end: new Date(currentEnd),
                    type: oneOf('open', 'closed'),
                };
                currentStart = currentEnd;
            }
        }

        const builder = build({
            fields: generate(timePeriodsGenerator),
        });

        const start = new Date('2025-01-01');
        const duration = 24 * 60 * 60 * 1000;

        const periods = builder.many(3, {
            initialParameters: [start, duration],
        });

        console.log(periods);
        // [
        //     {
        //         id: 0,
        //         start: 2025-01-01T00:00:00.000Z,
        //         end: 2025-01-02T00:00:00.000Z,
        //         type: 'open'
        //     },
        //     {
        //         id: 1,
        //         tart: 2025-01-02T00:00:00.000Z,
        //         end: 2025-01-03T00:00:00.000Z,
        //         type: 'closed'
        //     },
        //     {
        //         id: 2,
        //         start: 2025-01-03T00:00:00.000Z,
        //         end: 2025-01-04T00:00:00.000Z,
        //         type: 'closed'
        //     }
        // ]
    });
});
