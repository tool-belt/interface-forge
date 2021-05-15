[![GitHub license](https://img.shields.io/github/license/Goldziher/interfaceForge)](https://github.com/Goldziher/interfaceForge/blob/main/LICENSE)
![David](https://img.shields.io/david/Goldziher/interfaceForge)
[![codecov](https://codecov.io/gh/Goldziher/interfaceForge/branch/main/graph/badge.svg?token=1QdttZtggc)](https://codecov.io/gh/Goldziher/interfaceForge)
[![Maintainability](https://api.codeclimate.com/v1/badges/1fe90a85d374b3d38d9c/maintainability)](https://codeclimate.com/github/Goldziher/interfaceForge/maintainability)

Interface-Forge allows you to gracefully generate test data using TypeScript.

# Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
    -   [Basic Example](#basic-example)
    -   [Passing default values](#passing-default-values)
    -   [Passing a Factory Function](#passing-a-factory-function)
    -   [The .build method](#the-build-method)
    -   [The .batch method](#the-batch-method)
-   [Factory Schema](#factory-schema)
    -   [Using TypeFactory instances in factory schemas](#using-typefactory-instances-in-factory-schemas)
    -   [Using the .use static method](#using-the-use-static-method)
    -   [Using the .useBatch static method](#using-the-usebatch-static-method)
    -   [Using the .iterate method](#using-the-iterate-method)
    -   [Using the .bind method](#using-the-bind-method)

## Installation

```shell
yarn add --dev interface-forge
```

Or

```shell
npm install --save-dev interface-forge
```

## Usage

### Basic Example

<details>
  <summary>Click to expand!</summary>

To create a factory you need some TS types, for example:

```typescript
// types.ts

export interface UserProfile {
    profession: string;
    gender: string;
    age: number;
}

export interface Cat {
    name: string;
}

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    profile: UserProfile;
    cats: Cat[];
}
```

Then pass the type as a generic argument when creating an instance of TypeFactory alongside default values:

```typescript
// factories.ts
import { TypeFactory } from 'interface-forge';
import { User } from './types';

const UserFactory = new TypeFactory<User>({
    firstName: 'John',
    lastName: 'Smith',
    email: 'js@example.com',
    profile: {
        profession: 'cook',
        gender: 'male',
        age: 27,
    },
    cats: [],
});
```

Then use the factory to create an object of the desired type in a test file:

```typescript
// User.spec.ts

describe('User', () => {
    let user: User;

    beforeEach(async () => {
        // you can pass override values when calling build
        user = await UserFactory.build({
            firstName: 'Johanne',
            profile: {
                profession: 'Journalist',
                gender: 'Female',
                age: 31,
            },
            cats: [],
        });
        // user == {
        //     firstName: "Johanne",
        //     lastName: "Smith",
        //     email: "js@example.com",
        //     profile: {
        //         profession: "Journalist",
        //         gender: "Female",
        //         age: 31
        //     }
        // }
    });
    // ...
});
```

</details>

### Passing default values

When creating an TypeFactory instance you must pass default values as the first _required parameter_ to the constructor.
Default values can be either an object literal, a sync function returning an object literal, or an async function
returning a promise resolving to an object literal:

<details>
  <summary>Click to expand!</summary>

```typescript
// factories.ts
import { TypeFactory } from 'interface-forge';
import { User } from './types';

// using an object literal
const UserFactoryWithObjectLiteral = new TypeFactory<User>({
    firstName: 'John',
    lastName: 'Smith',
    email: 'js@example.com',
    profile: {
        profession: 'cook',
        gender: 'male',
        age: 27,
    },
    cats: [],
});

// using a sync function literal
const UserFactoryWithSyncFunction = new TypeFactory<User>(() => ({
    firstName: 'John',
    lastName: 'Smith',
    email: 'js@example.com',
    profile: {
        profession: 'cook',
        gender: 'male',
        age: 27,
    },
    cats: [],
}));

// using an async function
const UserFactoryWithAsyncFunction = new TypeFactory<User>(async () =>
    Promise.resolve({
        firstName: 'John',
        lastName: 'Smith',
        email: 'js@example.com',
        profile: {
            profession: 'cook',
            gender: 'male',
            age: 27,
        },
        cats: [],
    }),
);
```

</details>

For further details about what can be inside the defaults object see [_Factory Schema_](#factory-schema).

### Passing a Factory Function

You can also pass a second optional parameter to the TypeFactory constructor which is a factory function with the
following signature::

```typescript
type FactoryFunction<T> = (values: T, iteration: number) => T | Promise<T>;
```

This function will be called with two parameters `values` and optionally `iteration` (iteration is passed only when
building a batch). Values is an object containing the default values after these have been parsed. I.e. if you passed a
function as the first parameter to the constructor, this function will be called and its return value will be passed to
the factory function. The factory function should return the final object or a Promise resolving to the final object.

**NOTE**: Iteration begins at 0.

### The .build method

To use the factory to generate an object you should call `.build`. This method is `async` so it has to be awaited.
The `.build` method accepts an optional `options` object with two optional keys:

-   `overrides`: either an object literal, a function returning an object literal, or a promise resolving to an object
    literal. The values of the object are merged with the defaults using `Object.assign` - hence newer values passed in
    the overrides literally "override" the values stored in the defaults passed through the constructor.

-   `factory function`: a [factory function](#passing-a-factory-function). If a factory function was passed to the
    constructor, and a factory function is passed as a parameter to `.build`, the function passed as a parameter is used.

<details>
  <summary>Click to expand!</summary>

```typescript
describe('User', () => {
    let user: User;

    beforeEach(async () => {
        user = await UserFactory.build({
            overrides: async () =>
                Promise.resolve({
                    firstName: 'Johanne',
                    profile: {
                        profession: 'Journalist',
                        gender: 'Female',
                        age: 31,
                    },
                    cats: [],
                }),
            factory: (values: User, iteration: number) => {
                // do something
            },
        });
    });
    // ...
});
```

</details>

### The .batch method

If you need to generate multiple objects at the same time, you can use the `.batch` method. This method is also `async`,
and it returns a promise resolving to an array of objects of the given type. It accepts two parameters:

-   `size`: the number of objects to create - this is a _required parameter_.
-   `options`: the same as for [`.build`](#the-build-method).

<details>
  <summary>Click to expand!</summary>

```typescript
describe('User', () => {
    let users: User[];

    beforeEach(async () => {
        // you can pass override values when calling build
        users = await UserFactory.batch(3, {
            overrides: async () =>
                Promise.resolve({
                    firstName: 'Johanne',
                    profile: {
                        profession: 'Journalist',
                        gender: 'Female',
                        age: 31,
                    },
                    cats: [],
                }),
            factory: (values: User, iteration: number) => {
                // do something
            },
        });
        // each user now has a different age
    });
    // ...
});
```

</details>

## Factory Schema

Although the above example of default values is simply an object literal with static values, TypeFactory in fact expects
what is called a `FactorySchema` in the code. This is an object that can handle different types of values - including
other instances of TypeFactory, bound functions and generators.

### Using TypeFactory instances in factory schemas

You can place instances of TypeFactory as values:

<details>
  <summary>Click to expand!</summary>

```typescript
// factories.ts
import { TypeFactory } from 'interface-forge';
import { User, UserProfile } from './types';

const UserProfileFactory = new TypeFactory<UserProfile>({
    profession: 'cook',
    gender: 'male',
    age: 27,
});

const UserFactory = new TypeFactory<User>({
    firstName: 'John',
    lastName: 'Smith',
    email: 'js@example.com',
    profile: UserProfileFactory,
    cats: [],
});
```

</details>

The sub-factory's build method will be called.

### Using the .use static method

The caveat of placing an instance of InterfaceForce as a `FactorySchema` value is that you cannot pass values to the
sub-factory when `.build` is called. To solve this you can use the `.use` static method, which allows you to pass args
at build-time:

<details>
  <summary>Click to expand!</summary>

```typescript
const UserProfileFactory = new TypeFactory<UserProfile>({
    profession: 'cook',
    gender: 'male',
    age: 27,
});

const UserFactory1 = new TypeFactory<User>({
    firstName: 'John',
    lastName: 'Smith',
    email: 'js@example.com',
    profile: TypeFactory.use(UserProfileFactory, {
        profession: 'Librarian',
        gender: 'Other',
        age: '41',
    }),
    cats: [],
});

const UserFactory2 = new TypeFactory<User>({
    firstName: 'John',
    lastName: 'Smith',
    email: 'js@example.com',
    profile: TypeFactory.use(UserProfileFactory, () => ({
        profession: 'Librarian',
        gender: 'Other',
        age: '41',
    })),
    cats: [],
});

const UserFactory3 = new TypeFactory<User>({
    firstName: 'John',
    lastName: 'Smith',
    email: 'js@example.com',
    profile: TypeFactory.use(UserProfileFactory, async () =>
        Promise.resolve({
            profession: 'Librarian',
            gender: 'Other',
            age: '41',
        }),
    ),
    cats: [],
});
```

</details>

You can pass the same kind of options as you would when calling the `.build` method on the factory directly.

### Using the .useBatch static method

The `.useBatch` is the batch equivalent of the `.use` method. It allows you to place an instance of TypeFactory and
build a batch of objects while passing args at build-time:

<details>
  <summary>Click to expand!</summary>

```typescript
import { TypeFactory } from './type-factory';

const PetFactory = new TypeFactory<Pet>({
    name: TypeFactory.iterate(['Miezi', 'Eli', 'Garfield']),
});

const UserFactory3 = new TypeFactory<User>({
    firstName: 'John',
    lastName: 'Smith',
    email: 'js@example.com',
    profile: TypeFactory.use(UserProfileFactory, async () =>
        Promise.resolve({
            profession: 'Librarian',
            gender: 'Other',
            age: '41',
        }),
    ),
    cats: TypeFactory.useBatch(PetFactory, 3),
});
```

</details>

You can pass the same kind of options as you would when calling the `.batch` method on the factory directly.

### Using the .iterate method

Use the `iterate` static method to create an (infinite) iterator. Each time the `.build` method is called, the iterator
will yield the next value in the array. When reaching the array's end, iteration will begin from position 0 again:

<details>
  <summary>Click to expand!</summary>

```typescript
const UserFactory = new TypeFactory<User>({
    firstName: TypeFactory.iterate([
        'John',
        'Bob',
        'Will',
        'Mary',
        'Sue',
        'Willma',
    ]),
    lastName: 'Smith',
    email: 'js@example.com',
    profile: {
        profession: 'cook',
        gender: 'male',
        age: 27,
    },
});

describe('User', () => {
    let user1: User;
    let user2: User;

    beforeEach(async () => {
        user1 = await UserFactory.build({});
        // user == {
        //     firstName: "John",
        //     ...
        // }
        user2 = await UserFactory.build({});
        // user == {
        //     firstName: "Bob",
        //     ...
        // }
    });
    // ...
});
```

</details>

### Using the .bind method

The `.bind` method allows you to pass any `sync` or `async` function for a schema value. The function will be called at
build time with two parameters:

-   `values`: the default values merged with whatever values have been passed at build time.
-   `iteration`: the current build iteration

<details>
  <summary>Click to expand!</summary>

```typescript
import { TypeFactory } from './type-factory';
import faker from 'faker';

const UserFactory = new TypeFactory<User>({
    firstName: TypeFactory.iterate([
        'John',
        'Bob',
        'Will',
        'Mary',
        'Sue',
        'Willma',
    ]),
    lastName: 'Smith',
    email: TypeFactory.bind(() => faker.internet.email()),
    profile: {
        profession: 'cook',
        gender: 'male',
        age: TypeFactory.bind((_, i) => faker.datatype.number(i + 20)),
    },
});
```

</details>
