# mimicry-js

<img src="https://github.com/user-attachments/assets/f0d03bd3-c46b-45ff-9e8a-53a75b8434a2" width="200" />


A lightweight and flexible TypeScript library for generating mock data for your tests with predefined structures, \
functional field generators, traits, and post-processing capabilities.  \
It makes no assumptions about frameworks or libraries, and can be used with any test runner

**Mimicry-js** was inspired by [test-data-bot](github.com/jackfranklin/test-data-bot#readme) and offers more flexibility and advanced TypeScript support.

[![npm version](https://badge.fury.io/js/mimicry-js.svg)](https://badge.fury.io/js/mimicry-js)

## Motivation

Rather than creating random objects each time you want to test something in your system you can instead use a factory that can create fake data. This keeps your tests consistent and means that they always use data that replicates the real thing. If your tests work off objects close to the real thing they are more useful and there's a higher chance of them finding bugs.

## Installation

With npm:
```sh
npm install --save-dev mimicry-js
```
or using Yarn:
```sh
yarn add --dev mimicry-js
```

## Usage

### Basic Usage

Use the `build` function to create a builder. Just give a builder an object of fields you want to define:

```ts
import {build} from 'mimicry-js';

const builder = build({
    fields: {
        firstName: 'John',
        lastName: 'Doe',
    },
});

const profile = builder.one()

console.log(profile);
// { firstName: 'John', lastName: 'Doe' }
```
Once you've created a builder, you can call the `one` method it returns to generate an instance of that object - in this case, a `profile`.

You can also use the `many` method to create an array of instances of your object. The method expects a number indicating how many objects to generate.

```ts
const profiles = builder.many(3)

console.log(profiles);
// [
//     { firstName: 'John', lastName: 'Doe' },
//     { firstName: 'John', lastName: 'Doe' },
//     { firstName: 'John', lastName: 'Doe' }
// ]
```
#### Unique values

In the example above, you may notice that the objects returned by the builder are identical.
This is not ideal for your tests, so mimicry-js allows you to use functions and [iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators).


For example, a custom function that returns a single value from the set.
```ts
import {build} from 'mimicry-js';

// Returns one of the options
const getOneOf = <T>(options: T[]) => {
    return options[Math.floor(Math.random() * options.length)];
};

const builder = build({
    fields: {
        firstName: () => getOneOf(['John', 'Andrew']),
        lastName: 'Doe',
    },
});

const profiles = builder.many(2);

console.log(profiles);
// [
//     { firstName: 'John', lastName: 'Doe' },
//     { firstName: 'Andrew', lastName: 'Doe' }
// ]
```
The builder calls the specified function for the field when creating each instance.

> [!NOTE]
> In this case, the builder correctly infers the type for the field.

```ts
const profiles: {    
    firstName: string  
    lastName: string 
}[]
```

So you can also use various external libraries to generate random values (e.g., [Faker](https://github.com/faker-js/faker))

```ts
import {build} from 'mimicry-js';
import {faker} from '@faker-js/faker';

const builder = build({
    fields: {
        firstName: () => faker.person.firstName(),
        lastName: () => faker.person.lastName(),
    },
});
```


## Built-in value generators

### `fixed`

Since by default, the builder calls the provided functions to get field values, mimicry-js offers the `fixed` decorator, which allows keeping a value unchanged. \
For example, if we need the getName field in the generated object to be a function, we can wrap this function with `fixed`.

```ts
import {build, fixed} from 'mimicry-js';


const builder = build({
    fields: {
        type: 'plain',
        getName: fixed(() => 'Plain object'),
    },
});

const thing = builder.one();

console.log(thing.getName()); // --> "Plain object"
```

### `sequence`

Often you will be creating objects that have an ID that comes from a database, so you need to guarantee that it's unique. You can use `sequence`, which increments the value on each call, starting **from 0**:

```ts
import {build, sequence} from 'mimicry-js';

const profileBuilder = build({
    fields: {
        id: sequence(),
        firstName: 'John',
        lastName: 'Doe',
    },
});

const firstPerson = profileBuilder.one();
const secondPerson = profileBuilder.one();
const thirdPerson = profileBuilder.one();

// firstPerson.id === 0
// secondPerson.id === 1
// thirdPerson.id === 2
```

If you need more control, you can pass `sequence` a function that will be called with the number. This is useful to ensure completely unique emails, for example:

```ts
import {build, sequence} from 'mimicry-js';

const profileBuilder = build({
    fields: {
        firstName: 'John',
        lastName: 'Doe',
        email: sequence(x => `john${x}@mail.com`),
    },
});

const firstPerson = profileBuilder.one();
const secondPerson = profileBuilder.one();
const thirdPerson = profileBuilder.one();

// firstPerson.email === john0@mail.com
// secondPerson.email === john1@mail.com
// thirdPerson.email === john2@mail.com
```
### `oneOf`

If you want an object to have a random value, picked from a list you control, you can use oneOf:

```ts
import {build, oneOf} from 'mimicry-js';

const userBuilder = build({
    fields: {
        name: oneOf(['John', 'Andrew', 'Mike']),
    },
});

const user = userBuilder.one();

// user.name === "John" | "Andrew" | "Mike"
```

### `bool`

If you need something to be either `true` or `false`, you can use `bool`:

```ts
import {build, bool} from 'mimicry-js';

const userBuilder = build({
  fields: {
    isAdmin: bool(),
  },
});

const user = userBuilder.one();

// user.name === true | false
```

### `unique`

Mimicry-js offers another one way to generate unique values. The `unique` function returns a single value from the provided set once.

```ts
import {build, unique} from 'mimicry-js';

const userBuilder = build({
    fields: {
        firstName: unique(['John', 'Andrew', 'Mike']),
        lastName: 'Doe',
    },
});

const users = userBuilder.many(3);

console.log(users);

// [
//     { firstName: 'Andrew', lastName: 'Doe' },
//     { firstName: 'Mike', lastName: 'Doe' },
//     { firstName: 'John', lastName: 'Doe' }
// ]

userBuilder.one(); // throws Error "No unique options left!"
```
>[!WARNING]
> If there are no unused values left, `unique` throws an exception. Therefore, it's more appropriate to use this generator primarily in [overrides](#overrides) to control the set of values.

### `withPrev`

Sometimes we need unique but related values. For example, simulating the creation date of an entity. \
In such cases, you can use the `withPrev` decorator. It takes a function that has access to the result of the previous call of this function.

```ts
import {build, withPrev} from 'mimicry-js';

const userBuilder = build({
    fields: {
        name: 'John Doe',
        createdAt: withPrev((prevTimestamp?: number) => {
            const timestamp = prevTimestamp ?? new Date('2020').getTime();
            return timestamp + 1000;
        }),
    },
});

const firstUser = userBuilder.one();
const secondUser = userBuilder.one();
const thirdUser = userBuilder.one();

// firstUser.createdAt === 1577836801000
// secondUser.createdAt === 1577836802000
// thirdUser.createdAt === 1577836803000
```

> [!WARNING]
> Keep in mind that on the first call, the value will always be undefined. \
> Also, you need to inform the builder about the type of the received argument if a generic type is not specified for the builder itself.

## `postBuild` modifications and classes.

Often, we need not just plain objects but instances of classes. In this case, you can pass a `postBuild` function along with fields. \
It allows you to transform the generated object as needed, for example, to create a class instance.

```ts
import {build} from 'mimicry-js';

class User {
    constructor(
        public id: number,
        public name: string,
    ) {}
}

const userBuilder = build({
    fields: {
        id: 0,
        firstName: 'John',
        lastName: 'Doe',
    },
    postBuild: ({id, firstName, lastName}) => new User(id, `${firstName} ${lastName}`),
});

const user = userBuilder.one();

console.log(user);
// User { id: 0, name: 'John Doe' }
```

> [!NOTE]
> In this case, the builder infers the `one`s return type as `User`.
> 
> `const user: User`

## Overrides per-build

We often need to generate a random object but control one of the values directly for the purpose of testing. When you call a builder you can pass in `overrides` which will override the builder defaults:

```ts
import {build, sequence, oneOf} from 'mimicry-js';

const userBuilder = build({
    fields: {
        id: sequence(),
        name: oneOf('Sam', 'Andrew', 'Mike'),
    },
});

const user = userBuilder.one({
    overrides: {
        id: 5,
        name: 'John',
    },
});

console.log(user);
// { id: 1, name: 'John' }
```

If you need to edit the object directly, you can pass in a `postBuild` function when you call the builder. This will be called after Mimicry-js has generated the fake object, and lets you directly change it.

```ts
import {build, sequence, oneOf} from 'mimicry-js';

class User {
    constructor(
        public id: number,
        public name: string,
    ) {}
}

const userBuilder = build({
    fields: {
        id: sequence(),
        firstName: oneOf('Sam', 'Andrew', 'Mike'),
        lastName: oneOf('Doe', 'Smith', 'Jackson'),
    },
});

const user = userBuilder.one({
    overrides: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
    },
    postBuild: ({id, firstName, lastName}) => new User(id, `${firstName} ${lastName}`),
});

console.log(user);
// User { id: 5, name: 'John Doe' }
```

> [!NOTE]
> In this case, the builder also determines that the return type of the `one` method has changed to `User`.

Using `overrides` and `postBuild` lets you easily customise a specific object that a builder has created.

## Traits



[//]: # (____)

[//]: # ()
[//]: # (Also, a generator that returns unique values as long as they are available.)

[//]: # ()
[//]: # (```ts)

[//]: # (// Returns unique variant as long as they are available; otherwise, throw error.)

[//]: # (function* getUnique<T>&#40;variants: T[]&#41;: Generator<T>  {)

[//]: # (    const leftVariants = variants.concat&#40;&#41;;)

[//]: # ()
[//]: # (    while &#40;true&#41; {)

[//]: # (        if &#40;!leftVariants.length&#41; {)

[//]: # (            throw new Error&#40;'No unique variants left!'&#41;;)

[//]: # (        })

[//]: # ()
[//]: # (        const index = Math.floor&#40;Math.random&#40;&#41; * leftVariants.length&#41;;)

[//]: # (        const variant = leftVariants[index];)

[//]: # ()
[//]: # (        leftVariants.splice&#40;index, 1&#41;;)

[//]: # (        yield variant;)

[//]: # (    })

[//]: # (})

[//]: # ()
[//]: # (const builder = build&#40;{)

[//]: # (    fields: {)

[//]: # (        firstName: getUnique&#40;['John', 'Andrew', 'Mike']&#41;,)

[//]: # (        lastName: 'Doe',)

[//]: # (    },)

[//]: # (}&#41;;)

[//]: # ()
[//]: # (const profiles = builder.many&#40;3&#41;;)

[//]: # ()
[//]: # (console.log&#40;profiles&#41;;)

[//]: # (// [)

[//]: # (//     { firstName: 'Mike', lastName: 'Doe' },)

[//]: # (//     { firstName: 'John', lastName: 'Doe' },)

[//]: # (//     { firstName: 'Andrew', lastName: 'Doe' })

[//]: # (// ])

[//]: # (```)

---

## License

MIT

