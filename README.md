[![GitHub license](https://img.shields.io/github/license/Goldziher/interfaceForge)](https://github.com/Goldziher/interfaceForge/blob/main/LICENSE)
![David](https://img.shields.io/david/Goldziher/interfaceForge)
[![codecov](https://codecov.io/gh/Goldziher/interfaceForge/branch/main/graph/badge.svg?token=1QdttZtggc)](https://codecov.io/gh/Goldziher/interfaceForge)
[![Maintainability](https://api.codeclimate.com/v1/badges/1fe90a85d374b3d38d9c/maintainability)](https://codeclimate.com/github/Goldziher/interfaceForge/maintainability)

Interface-Forge allows you to gracefully generate dynamic mock data and static fixtures in TypeScript.

# Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
    -   [Basic Example](#basic-example)
    -   [Passing default values](#passing-default-values)
        -   [Note regarding iteration](#note-regarding-iteration)
    -   [Passing a Factory Function](#passing-a-factory-function)
    -   [Building Objects](#building-objects)
    -   [Batch building](#batch-building)
        -   [Note regarding async](#note-regarding-async)
    -   [Creating and Using Fixtures](#creating-and-using-fixtures)
-   [Factory Schema](#factory-schema)
    -   [Using TypeFactory instances in factory schemas](#using-typefactory-instances-in-factory-schemas)
    -   [Using the .use static method with nested factories](#using-the-use-static-method-with-nested-factories)
    -   [Using .use with custom functions](#using-use-with-custom-functions)
    -   [Designating a required build-time argument](#designating-a-required-build-time-argument)
    -   [Using Generators](#using-generators)
        -   [The .iterate method](#the-iterate-method)
        -   [The .sample method](#the-sample-method)
-   [Contributing](#contributing)

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

To create a factory you need some TS types:

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

Pass the desired type as a generic argument when instantiating TypeFactory, alongside default values for the factory:

```typescript
// factories.ts
import { TypeFactory } from 'interface-forge';
import { User } from './types';

// i is type number
const UserFactory = new TypeFactory<User>((i) => ({
    firstName: 'John',
    lastName: 'Smith',
    email: 'js@example.com',
    profile: {
        profession: 'cook',
        gender: 'male',
        age: 27 + i,
    },
    cats: [],
}));
```

Then use the factory to create an object of the desired type in a test file:

```typescript
// User.spec.ts

describe('User', () => {
    // you can pass override values when calling build
    const user = UserFactory.buildSync({
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
    //     },
    //     cats: []
    // }
    // ...
});
```

### Passing default values

When creating an instance you must pass default values as the first parameter to the constructor. Defaults can be
either an object, a sync function returning an object, or an async function returning a promise resolving to an object:

```typescript
// factories.ts
import { TypeFactory } from 'interface-forge';
import { User } from './types';

// using an object literal
const UserFactoryWithObjectLiteral = new TypeFactory<User>({
    // ...
});

// using a sync function literal
const UserFactoryWithSyncFunction = new TypeFactory<User>((iteration) => {
    // ...
    return {
        // ... values
    };
});

// using an async function
const UserFactoryWithAsyncFunction = new TypeFactory<User>(
    async (iteration) => {
        // ... async code
        return {
            // ... values
        };
    },
);
```

For further details about what can be inside the defaults object see [_Factory Schema_](#factory-schema).

#### Note regarding iteration

Iteration begins at 0 by default. You can reset the internal counter by calling the `.resetCounter` method. If you wish
to begin iteration at a value other than 0, you can pass the this as a parameter to `.resetCounter`.

### Passing a Factory Function

You can also pass a second optional parameter to the TypeFactory constructor which is a factory function with the
following signature:

```typescript
type FactoryFunction<T> = (values: T, iteration: number) => T | Promise<T>;
```

This function will be called with two parameters `values` and `iteration`. Values is an object containing the default
values after these have been parsed. I.e. if you passed a function as the first parameter to the constructor, this
function will be called and its return value will be passed to the factory function. The factory function should return
the final object or a Promise resolving to the final object.

### Building Objects

To use the factory to generate an object you should call either `.build` or `.buildSync`. The difference between the two
is that `.build` is async while `.buildSync` is not. You can pass options to the build method - these can either be an
object containing key-value pairs that (partially) override the defaults with which the factory was initialized, a
function or async function returning such overrides, or an object with two optional keys:

-   `overrides`: either an object literal, a function returning an object literal, or a promise resolving to an object
    literal. The values of the object are merged with the defaults using `Object.assign` - hence newer values passed in
    the overrides literally "override" the values stored in the defaults passed through the constructor.

-   `factory function`: a [factory function](#passing-a-factory-function). If a factory function was passed to the
    constructor, and a factory function is passed as a parameter to `.build`, the function passed as a parameter is used.

```typescript
describe('User', () => {
    const user = UserFactory.buildSync({ firstName: "George" })
    // or
    const user = UserFactory.buildSync((iteration) => ({ firstName: "George" + " " + iteration.toString() }))
    // or
    const user = UserFactory.buildSync({
        overrides: () => ({ ... }),
        factory: (values, iteration) => {
            // ...
        }
    })
    // or
    let user: User
    beforeEach(async () => {
        user = await UserFactory.build({ firstName: "George" })
        // or
        user = await UserFactory.build(() => ({ firstName: "George" }))
        // or
        user = await UserFactory.build({
            overrides: async (iteration) => ({
                // ...
            }),
            // values: user, iteration: number
            factory: (values, iteration) => {
                // ...
            },
        });
    });
    // ...
});

describe('User', () => {
    const users = UserFactory.batchSync(3, { firstName: "George" })
    // or
    const users = UserFactory.batchSync(3, (iteration) => ({ firstName: "George" + " " + iteration.toString() }))
    // or
    const users = UserFactory.batchSync(3, {
        overrides: () => ({ ... }),
        factory: (values, iteration) => {
            // ...
        }
    })

    // or
    let users: User[]
    beforeEach(async () => {
        users = await UserFactory.batch(3, { firstName: "George" })
        // or
        users = await UserFactory.batch(3, () => ({ firstName: "George" }))
        // or
        users = await UserFactory.batch(3, {
            overrides: async (iteration) => ({
                // ...
            }),
            // values: user, iteration: number
            factory: (values, iteration) => {
                // ...
            },
        });
    });
    // ...
});

// OR
```

### Batch building

If you need to generate multiple objects at the same time, you can use either `.batch` or `.batchSync` methods. The
difference between the two is that `.batch` is async while `.batchSync` is not. Thus `.batch` returns a promise
resolving to an array of objects of the given type, and `.batchSync` returns the array directly.

Both methods accept two parameters:

-   `size`: the number of objects to create - this is a _required parameter_.
-   `options`: the same as for [the regular build methods](#building-objects).

```typescript
describe('User', () => {
    let users: User[];

    beforeEach(async () => {
        // you can pass override values when calling build
        users = await UserFactory.batch(3, {
            overrides: async (iteration) => ({
                // ...
            }),
            // values: user, iteration: number
            factory: (values, iteration) => {
                // ...
            },
        });
    });
    // ...
});
```

#### Note regarding async

If you call `.buildSync` or `.batchSync` on a factory that has been initialized with async defaults, or while passing
async overrides / factory function to the method, an informative error will be thrown.

### Creating and Using Fixtures

To use the package to generate fixtures you can simply import `FixtureFactory` instead of `TypeFactory`. The fixture class extends TypeFactory with four additional methods, which allow you to save static builds of your factory to your disk. This can be helpful where you don't want the result of a build to change everytime it runs (i.e. when snapshot testing).

The FixtureFactory's method require a file name or a file path as a (first) parameter and their naming corresponds to the respective build method: `.fixture` `.fixtureSync`, `.fixtureBatch`, `.fixtureBatchSync`.

```typescript
// factories.ts
import { FixtureFactory } from 'interface-forge';
import { User } from './types';

const UserFactory = new FixtureFactory<User>({
    // ...
});

describe('User', () => {
    it('matches snapshot', async () => {
        // compares stored data to a new build
        // will be saved to: ${cwd}/users.json
        const users = await UserFactory.fixtureBatch('users', 3);
        // if the comparison fails, a new fixture will have been saved
        // so the snapshot should (and will) also fail
        expect(users).toMatchSnapshot();
    });
    // ...
});
```

## Factory Schema

Although the above examples of default values use a simple object literal with static values, TypeFactory in fact
expects what is called a `FactorySchema` in the code. This is an object that can handle different types of values -
including other instances of TypeFactory, functions and generators.

### Using TypeFactory instances in factory schemas

You can place instances of TypeFactory as values:

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

When building and instance of UserFactory, the nested UserProfileFactory's will be built. The decision whether to use
the async or sync build methods depends on what method was called on the containing factory. Thus if the async
UserFactory.build()
is called, then then async UserProfileFactory.build() will be called in the nested factory etc.

### Using the .use static method with nested factories

The caveat of placing an instance of TypeFactory as a `FactorySchema` value is that you cannot pass values to the
sub-factory at build-time. To solve this you can use the `.use` static method, which allows you to pass args:

```typescript
const UserProfileFactory = new TypeFactory<UserProfile>({
    profession: 'cook',
    gender: 'male',
    age: 27,
});

const UserFactory = new TypeFactory<User>({
    // ...
    profile: TypeFactory.use<UserProfile>(UserProfileFactory, {
        overrides: (iteration) => ({
            // ...
        }),
        // values: UserProfile, iteration: number
        factory: (values, iteration) => {
            // ...
        },
    }),
    // ...
});
```

You can pass the same kind of options as for [the regular build methods](#building-objects).

If you want to build multiple objects, i.e. to call `.batch` or `.batchSync` for a nested factory, simple pass as part
of the options a `{ batch: number }` key-value pair:

```typescript
const UserFactory = new TypeFactory<User>({
    // ...
    profile: TypeFactory.use<UserProfile>(UserProfileFactory, {
        batch: 3,
        overrides: (iteration) => ({}),
        factory: (values, iteration) => {
            // ...
        },
    })
    // or
    profile: TypeFactory.use<UserProfile>(UserProfileFactory, {
        batch: 3
        //...
    }),
    // or
    profile: TypeFactory.use<UserProfile>(UserProfileFactory, () => ({
        batch: 3
        //...
    })),
});
```

### Using .use with custom functions

The `.use` method also allows you to pass any `sync` or `async` function for a schema value. The function will be called
at build time with the current iteration of the factory:

```typescript
import { TypeFactory } from './type-factory';
import faker from 'faker';

const UserFactory = new TypeFactory<User>({
    // ...
    profile: {
        // ...
        profession: TypeFactory.use((iteration): string => {
            if (iteration % 2 === 0) {
                return 'cook';
            } else {
                return 'librarian';
            }
        }),
    },
});
```

### Designating a required build-time argument

Sometimes its desirable to designate a property as an argument that must be supplied at build-time. To do this simply
call the `.required` static method for each required property:

```typescript
const UserFactory = new TypeFactory<User>({
    firstName: TypeFactory.required(),
    lastName: TypeFactory.required(),
    // ...
});

describe('User', () => {
    let user: User;

    beforeEach(async () => {
        user = await UserFactory.build();
        // Error: [interface-forge] missing required build arguments: firstName, lastName
        // To avoid an error:
        // user = await UserFactory.build({ firstName: "Moishe", lastName: "Zuchmir" });
    });
    // ...
});
```

### Using Generators

You can place
a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) as a
factory schema value. At build-time, the generator's `.next` method will be called. You should be careful. though,
when doing this: The generator function does not return or yield `{done: true}` during build-time.

There are two built-in convenience static methods that create _infinite_ generators: `.iterate` and `.sample`. Both
methods accept an [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) as a
value, e.g. an Array, Set, Map etc.

**NOTE** do not pass an infinite iterator to these builtin methods: It will create an infinite loop.

#### The .iterate method

Use the `iterate` static method to create an infinite iterator that yields the values passed to it serially. Each
time `.next` is called, the next value in the iterator is returned. When reaching the iterator's end, iteration will
begin from position 0 again:

```typescript
const UserFactory = new TypeFactory<User>({
    firstName: TypeFactory.iterate(['John', 'Bob']),
    // ...
});

describe('User', () => {
    let user1: User;
    let user2: User;

    beforeEach(async () => {
        user1 = await UserFactory.build();
        // user == {
        //     firstName: "John",
        //     ...
        // }
        user2 = await UserFactory.build();
        // user == {
        //     firstName: "Bob",
        //     ...
        // }
        user3 = await UserFactory.build();
        // user == {
        //     firstName: "John",
        //     ...
        // }
    });
    // ...
});
```

#### The .sample method

Use the `sample` static method to create an infinite iterator that returns a random value each time its called. If the
iterator contains more than one item, the current and previous values are guaranteed to be different.

```typescript
const UserFactory = new TypeFactory<User>({
    firstName: TypeFactory.sample([
        'John',
        'Bob',
        'Will',
        'Mary',
        'Sue',
        'Willma',
    ]),
    // ...
});

describe('User', () => {
    let user1: User;
    let user2: User;

    beforeEach(async () => {
        user1 = await UserFactory.build();
        // user == {
        //     firstName: "Sue",
        //     ...
        // }
        user2 = await UserFactory.build();
        // user == {
        //     firstName: "Will",
        //     ...
        // }
    });
    // ...
});
```

## Contributing

Contributions are welcome. Please see the [contributing guide](CONTRIBUTING.md)
