import {createBuilder} from '../builder';
import {sequence} from '../../generators/sequence';
import {oneOf} from '../../generators/oneOf';

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

            const builder = createBuilder<IProfileData>({
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

            const builder = createBuilder<IProfileData, Profile>({
                fields: profile,
                postBuild: (generatedFields) => new Profile(generatedFields),
            });

            const double = new Profile(profile);
            expect(builder.one()).toBeInstanceOf(Profile);
            expect(builder.many(2)).toEqual([double, double]);
        });
    });

    describe('traits checks', () => {
        it('should build by fields configuration', () => {
            const profile = {
                firstName: 'John',
                lastName: 'Doe',
                age: 30,
            };

            const builder = createBuilder<IProfileData>({
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

            const double = profile;
            expect(builder.one()).toEqual(double);
            expect(builder.many(2)).toEqual([double, double]);
        });

        it('should build by fields configuration with one trait modification', () => {
            const profile = {
                firstName: 'John',
                lastName: 'Doe',
                age: 30,
            };

            const builder = createBuilder<IProfileData>({
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

            const builder = createBuilder({
                fields: profile as IProfileData,
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

            const builder = createBuilder<IProfileData>({
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

            const builder = createBuilder({
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

            const builder = createBuilder({
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

            const tagBuilder = createBuilder({
                fields: {
                    name: 'tag',
                    id: sequence(),
                },
            });

            const builder = createBuilder({
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

        it('should build by fields configuration with sequence generator', () => {
            class Book {
                constructor(
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

            const builder = createBuilder({
                fields: {
                    title: 'My Book',
                    author: {
                        id: sequence(),
                        name: 'John Doe',
                    },
                },
                postBuild: (generatedFields) =>
                    new Book(
                        generatedFields.title,
                        // @ts-ignore TODO fix nested objects types
                        new Author(generatedFields.author.id, generatedFields.author.name),
                    ),
            });

            expect(builder.one()).toEqual(new Book('My Book', new Author(0, 'John Doe')));
            expect(builder.one().author).toBeInstanceOf(Author);
            expect(builder.many(2)).toEqual([
                new Book('My Book', new Author(2, 'John Doe')),
                new Book('My Book', new Author(3, 'John Doe')),
            ]);
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

            const authorBuilder = createBuilder({
                fields: {
                    id: sequence(),
                    name: sequence((counter) => {
                        return `Charles ${counter}`;
                    }),
                },
                postBuild: (generatedFields) => new Author(generatedFields.id, generatedFields.name),
            });

            const builder = createBuilder({
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

    describe('sequence generator checks', () => {});

    describe('oneOf generator checks', () => {});
});
