import {build} from '../builder';
import {sequence} from '../../generators/sequence';
import {oneOf} from '../../generators/oneOf';
import {fixed} from '../../generators/fixed';
import {withPrev} from '../../generators/withPrev';
import {FieldsConfiguration} from '../types';
import {bool} from '../../generators/bool';
import {unique} from '../../generators/unique';

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

describe('builder checks', () => {
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
    });

    describe('builders with complex types', () => {
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

        it('should build by fields with nested configuration', () => {
            class Genre {
                constructor(
                    public id: number,
                    public name: string,
                ) {}
            }

            class Book {
                constructor(
                    public id: number,
                    public title: string,
                    public genre: Genre,
                ) {}
            }

            type Fields = {
                id: number;
                title: string;
                genre: {
                    id: number;
                    name: string;
                };
            };

            const fields: FieldsConfiguration<Fields> = {
                id: sequence(),
                title: sequence((x) => `Book ${x}`),
                genre: {
                    id: sequence(),
                    name: sequence((x) => `Genre ${x}`),
                },
            };

            const bookBuilder = build({
                fields,
                postBuild: (generatedFields) =>
                    new Book(
                        generatedFields.id,
                        generatedFields.title,
                        new Genre(generatedFields.genre.id, generatedFields.genre.name),
                    ),
            });

            const double_1 = bookBuilder.one();
            const double_2 = bookBuilder.one();

            expect(double_1).toEqual(new Book(0, 'Book 0', new Genre(0, 'Genre 0')));
            expect(double_2).toEqual(new Book(1, 'Book 1', new Genre(1, 'Genre 1')));
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

            const first = profiles[0].firstName;
            const second = profiles[1].firstName;
            const third = profiles[2].firstName;

            const leftNames = ['John', 'Andrew', 'Mike'];
            expect(leftNames).toContain(first);
            leftNames.splice(leftNames.indexOf(first), 1);
            expect(leftNames).toContain(second);
            leftNames.splice(leftNames.indexOf(second), 1);
            expect(leftNames).toContain(third);
            leftNames.splice(leftNames.indexOf(third), 1);

            expect(leftNames).toHaveLength(0);

            expect(() => builder.one()).toThrow('No unique options left!');
        });
    });

    it('should show log', () => {
        // Returns unique variant as long as they are available; otherwise, throw error.
        function* getUnique<T>(variants: T[]): Generator<T> {
            const leftVariants = variants.concat();

            while (true) {
                if (!leftVariants.length) {
                    throw new Error('No unique variants left!');
                }

                const index = Math.floor(Math.random() * leftVariants.length);
                const variant = leftVariants[index];

                leftVariants.splice(index, 1);
                yield variant;
            }
        }

        const builder = build({
            fields: {
                firstName: getUnique(['John', 'Andrew', 'Mike']),
                lastName: 'Doe',
            },
        });

        const profiles = builder.many(3);

        console.log(profiles);
    });
});
