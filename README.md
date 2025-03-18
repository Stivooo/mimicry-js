# mimicry-js

<img src="https://github.com/user-attachments/assets/f0d03bd3-c46b-45ff-9e8a-53a75b8434a2" width="200" />

[![npm version](https://badge.fury.io/js/mimicry-js.svg)](https://badge.fury.io/js/mimicry-js)


A lightweight and flexible TypeScript library for generating mock data for your tests with predefined structures, \
functional field generators, traits, and post-processing capabilities.  \
It makes no assumptions about frameworks or libraries, and can be used with any test runner

**Mimicry-js** was inspired by [test-data-bot](github.com/jackfranklin/test-data-bot#readme) and offers more flexibility and advanced TypeScript support.

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
This is not ideal for your tests, so mimicry-js allows you to use functions and iterators.


For example, a custom function that returns a single value from the set.
```ts
// Returns one of the variants
const getOneOf = <T>(variants: T[]) => {
    return variants[Math.floor(Math.random() * variants.length)];
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

> In this case, the builder correctly infers the type for the field.

```ts
const profiles: {    
    firstName: string  
    lastName: string 
}[]
```

You can also use various external libraries to generate random values (e.g., [Faker](https://github.com/faker-js/faker))

```ts
const builder = build({
    fields: {
        firstName: () => faker.person.firstName(),
        lastName: () => faker.person.lastName(),
    },
});
```


## Built-in value generators

### TODO

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

## License

MIT

