# mimicry-js

<img src="https://github.com/user-attachments/assets/f0d03bd3-c46b-45ff-9e8a-53a75b8434a2" width="200" />


A lightweight and flexible TypeScript library for generating mock data for your tests with predefined structures, \
functional field generators, traits, and post-processing capabilities.  \
It makes no assumptions about frameworks or libraries, and can be used with any test runner

**Mimicry-js** was inspired by [test-data-bot](https://github.com/jackfranklin/test-data-bot#readme) and offers more flexibility and advanced TypeScript support.

[![npm version](https://badge.fury.io/js/mimicry-js.svg)](https://badge.fury.io/js/mimicry-js)

<details open>
  <summary>Table of Contents</summary>

- [Motivation](#motivation)
- [Installation](#installation)
- [Usage](#usage)
    - [Basic Usage](#basic-usage)
    - [Unique values](#unique-values)
- [Built-in value generators](#built-in-value-generators)
    - [`fixed`](#fixed)
    - [`sequence`](#sequence)
    - [`oneOf`](#oneof)
    - [`bool`](#bool)
    - [`unique`](#unique)
    - [`withPrev`](#withprev)
- [`postBuild` modifications and classes](#postbuild-modifications-and-classes)
- [Overrides per-build](#overrides-per-build)
- [Traits](#traits)
- [Advanced features](#advanced-features)
    - [The entire result of the previous build](#retrieving-the-entire-result-of-the-previous-build)
    - [Plain object merging](#deep-plain-object-merging-in-overrides-and-traits)
    - [Nested array](#nested-array-of-configurations-with-field-generators)
    - [Custom generators](#custom-generators)
- [About TypeScript types](#about-typescript-types)

</details>

## Motivation

Rather than creating random objects each time you want to test something in your system you can instead use a builder that can create fake data. This keeps your tests consistent and means that they always use data that replicates the real thing. If your tests work off objects close to the real thing they are more useful and there's a higher chance of them finding bugs.

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

Mimicry-js offers another one way to generate unique values. The `unique` function returns a single unique value from the provided set once on each call.

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
> If there are no unused values left, `unique` throws an exception. Therefore, it's more appropriate to use this generator primarily in [overrides](#overrides-per-build) to control the set of values.

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
> Keep in mind that on the first call, the value will always be an `undefined`. \
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
// { id: 5, name: 'John' }
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

Traits let you define a set of overrides for a builder that can easily be re-applied. Let's imagine you've got a users builder where users can have a support role and a certain email:

```ts
import {build, sequence, oneOf} from 'mimicry-js';

interface User {
    id: number;
    name: string;
    role: 'customer' | 'support' | 'administrator';
    email?: string;
}

const userBuilder = build<User>({
    fields: {
        id: sequence(),
        name: oneOf('John', 'Andrew', 'Mike'),
        role: oneOf('customer', 'support', 'administrator'),
    },
    traits: {
        support: {
            overrides: {
                role: 'support',
                email: 'support@mail.com',
            },
        },
    },
});

const support = userBuilder.one({traits: 'support'});

console.log(support);
// { id: 0, name: 'John', role: 'support', email: 'support@mail.com' }
```
Note that the `support` trait is specified above. As a result, the role and email fields will be overwritten on each call, and we don't have to do this manually using `overrides`:

```ts
const support = userBuilder.one({
    overrides: {
        role: 'support',
        email: 'support@mail.com',
    },
});
```

So now building a support user is easy:

```ts
const support = userBuilder.one({traits: 'support'});
```

### Multiple traits

You can define and use multiple traits when building an object. Be aware that if two traits override the same value, the one passed in last wins:

```ts
import {build, sequence, oneOf} from 'mimicry-js';

interface User {
    id: number;
    name: string;
    role: 'customer' | 'support' | 'administrator';
    email?: string;
}

const userBuilder = build<User>({
    fields: {
        id: sequence(),
        name: oneOf('John', 'Andrew', 'Mike'),
        role: oneOf('customer', 'support', 'administrator'),
    },
    traits: {
        customer: {
            overrides: {
                role: 'customer',
            },
        },
        withContactDetails: {
            overrides: {
                email: 'contact@mail.com',
            },
        },
    },
});

const customer = userBuilder.one({traits: ['customer', 'withContactDetails']});

console.log(customer);
// { id: 0, name: 'John', role: 'customer', email: 'contact@mail.com' }
```

> [!NOTE]
> You can use [overrides](#overrides-per-build) together with `traits`. In this case, values from `overrides` will override the corresponding ones from `traits`.

## Advanced features

### Retrieving the entire result of the previous build

Sometimes we need to generate complex objects with related values. In this case, the builder allows passing fields as a function that returns an object to build and takes the result of the previous call.

For example, in the code below, the `price` field depends on the value of the `count` field. Moreover, the `count` field changes with each build, so we need access to the result of the previous call.

```ts
import {build, sequence} from 'mimicry-js';

interface Order {
    count: number;
    price: number;
}

const orderBuilder = build({
    fields: (previous?: Order) => {
        const count = previous ? previous.count + 1 : 1;

        return {
            count: sequence((x) => ++x),
            price: 1000 * count,
        };
    },
});

const orders = orderBuilder.many(3);

console.log(orders);
// [
//     { count: 1, price: 1000 },
//     { count: 2, price: 2000 },
//     { count: 3, price: 3000 }
// ]
```

> [!WARNING]
> Note that the value of the previous build will always be `undefined` on the first call. \
> Also, you need to inform the builder about the type of the received argument if a generic type is not specified for the builder itself.

> [!NOTE]
> The builder preserves iterators after the first function call and continues using them instead of creating new ones, even though the function passed as `fields` is called each time.

### Deep plain object merging in `overrides` and `traits`.

Let's imagine that one of the object's fields is another object that also requires fake data.

```ts
import {build, sequence, oneOf} from 'mimicry-js';

interface Account {
    id: number;
    name: string;
    address: {
        apartment: string;
        street: string;
        city: string;
        postalCode: number;
    };
}

const builder = build<Account>({
    fields: {
        id: sequence(),
        name: 'John',
        address: {
            apartment: sequence((x) => x.toString()),
            street: oneOf('123 Main St', '456 Elm Ave'),
            city: oneOf('New York', 'Los Angeles'),
            postalCode: sequence((x) => x + 1000),
        },
    },
});

const account = builder.one();

console.log(account);
// {
//   id: 0,
//   name: 'John',
//   address: {
//     apartment: '0',
//     street: '456 Elm Ave',
//     city: 'Los Angeles',
//     postalCode: 1000
//   }
// }
```

> [!NOTE]
> You can just as easily create a separate builder for the `address` object and use it, but in this case, the data will be static.

> [!WARNING]
> Note that in this case, you must specify the type to ensure the builder correctly infers types.

When using this builder, we may need to override certain fields, such as `city` and `street` of the address.
So, we can do that:

```ts
const account = builder.one({
    overrides: {
        address: {
            city: 'San Francisco',
            street: '101 Pine Ln',
        },
    },
});

console.log(account);
// {
//   id: 0,
//   name: 'John',
//   address: {
//     apartment: '0',
//     street: '101 Pine Ln',
//     city: 'San Francisco',
//     postalCode: 1000
//   }
// }
```

You may notice that we don't need to specify all the fields of the `address` object in overrides.
This behavior is also similar for `traits`:

```ts
const builder = build<Account>({
    fields: {
        id: sequence(),
        name: 'John',
        address: {
            apartment: sequence((x) => x.toString()),
            postalCode: sequence((x) => x + 1000),
            street: '',
            city: '',
        },
    },
    traits: {
        NY: {
            overrides: {
                address: {
                    street: '123 Main St',
                    city: 'New York',
                },
            },
        },
        LA: {
            overrides: {
                address: {
                    street: '456 Elm Ave',
                    city: 'Los Angeles',
                },
            },
        },
    },
});

const account = builder.one({
    traits: 'LA',
});

console.log(account);
// {
//   id: 0,
//   name: 'John',
//   address: {
//     apartment: '0',
//     postalCode: 1000,
//     street: '456 Elm Ave',
//     city: 'Los Angeles'
//   }
// }
```

### Nested array of configurations with field generators

The builder checks the values of arrays in the provided fields to handle nested generators.

```ts
import {build, sequence, oneOf} from 'mimicry-js';

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

console.log(account);
// {
//   id: 0,
//   name: 'John',
//   addresses: [
//     {
//       apartment: '0',
//       street: '456 Elm Ave',
//       city: 'Los Angeles',
//       postalCode: 98101
//     },
//     {
//       apartment: '0',
//       street: '101 Pine Ln',
//       city: 'San Francisco',
//       postalCode: 10001
//     }
//   ]
// }
```

> [!NOTE]
> However, the builder does not perform deep merging of arrays in `traits` and `overrides`.

> [!WARNING]
> Note that in this case, you must specify the type to ensure the builder correctly infers types.

### Custom generators

You can also use custom iterators to generate field values:

```ts
import {build} from 'mimicry-js';

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

// first.exponent === 2
// second.exponent === 4
// third.exponent === 8
```

## About TypeScript types

Mimicry-js is written in TypeScript and ships with the types generated so if you're using TypeScript you will get some nice type support out the box. \
The builder below, in addition to the object with fields, has a set of traits and a postBuild transformer.

```ts
import {build} from 'mimicry-js';

class Profile {
    name: string;
    age?: number;

    constructor({firstName, lastName, age}: IProfileData) {
        this.name = `${firstName} ${lastName}`;
        this.age = age;
    }
}

const profile = {
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
};

const builder = build({
    fields: profile,
    traits: {
        younger: {
            overrides: {
                age: 18,
            },
        },
        older: {
            overrides: {
                age: 50,
            },
        },
    },
    postBuild: (generatedFields) => new Profile(generatedFields),
});
```
And it has all the information about the input data types, trait names, and the result type:

```ts
const builder: Builder<{
    firstName: string
    lastName: string
    age: number
}, Profile, "younger" | "older">
```

So, in most situations, types don’t need to be specified manually, except for cases with generators in [nested objects](#deep-plain-object-merging-in-overrides-and-traits) and [arrays](#nested-array-of-configurations-with-field-generators).

> [!IMPORTANT]
> If you manually specify the builder object's generic, the builder loses information about the specific `traits` names (the type becomes `string`). This is due to TypeScript's behavior: default values are used for all generics if even one of them is provided.
>
> ```ts
> const builder = build<Profile>({ ... });
> ```
> ```ts
> const builder: Builder<Profile, Profile, string>
> ```

So, if you want to get type checking and use type-based code suggestions when filling out fields, while allowing the builder to infer types automatically, you can use the built-in `FieldsConfiguration` type:

```ts
import {build, sequence, FieldsConfiguration} from 'mimicry-js';

interface IProfileData {
    id: number;
    firstName: string;
    lastName: string;
    age?: number;
}

const profile: FieldsConfiguration<IProfileData> = {
    id: sequence(),
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
};

const builder = build({
    fields: profile,
    postBuild: (generatedFields) => new Profile(generatedFields),
    traits: {
        younger: {
            overrides: {
                age: 18,
            },
        },
        older: {
            overrides: {
                age: 50,
            },
        },
    },
});
```

As a result, the builder retains all the type information and can validate the trait names passed to it, while you get all the TypeScript checks when filling out the fields.

```ts
const builder: Builder<IProfileData, Profile, "younger" | "older">
```

```ts
builder.one({
    traits: 'other'
})

// TS2322: Type "other" is not assignable to type
// "younger" | "older" | ("younger" | "older")[] | undefined
```

## License

MIT

