---
id: usage
title: Usage
description: Usage guidance & examples
slug: /usage
sidebar_label: 'Usage'
sidebar_position: 2
---

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

- `overrides`: either an object literal, a function returning an object literal, or a promise resolving to an object
    literal. The values of the object are merged with the defaults using `Object.assign` - hence newer values passed in
    the overrides literally "override" the values stored in the defaults passed through the constructor.

- `factory function`: a [factory function](#passing-a-factory-function). If a factory function was passed to the
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

- `size`: the number of objects to create - this is a _required parameter_.
- `options`: the same as for [the regular build methods](#building-objects).

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

To use the package to generate fixtures you can simply import `FixtureFactory` instead of `TypeFactory`. The fixture class extends TypeFactory with four additional methods, which allow you to save static builds of a factory to your disk. This can be helpful where you don't want the result of a build to change everytime it runs (i.e. when snapshot testing). The methods' naming corresponds to the respective build method: `.fixture`, `.fixtureSync`, `.fixtureBatch`, `.fixtureBatchSync`.

The FixtureFactory's methods require a file name (or file path) as the first parameter. You can also designate a default path for all of a factory's builds, by passing a third parameter to the constructor. The file names will then be appended to this designated default path, instead. Either way the **file path must be absolute** or else interface-forge will throw an error.

```typescript
// ${projectRoot}/tests/User.spec.ts
import { FixtureFactory } from 'interface-forge';
import { User, Profile } from '../types';

// without default file path
const UserFactory = new FixtureFactory<User>(
    {
        // ...
    },
);

describe('User', () => {
    it('matches snapshot', async () => {
        // compares stored data to a new build
        // will be saved to: ${projectRoot}/__fixtures__/users.json
        const users = await UserFactory.fixtureBatch(
            // path.join() or path.resolve() are recommended
            path.join(__dirname, '../users'),
            3,
        );

        // if the comparison fails, a new fixture will have been saved
        // so the snapshot should (and will) also fail
        expect(users).toMatchSnapshot();
    });
    // ...
});

// with default file path
const ProfileFactory = new FixtureFactory<Profile>(
    {
        // ...
    },
    undefined,
    // path.join() or path.resolve() are recommended
    path.resolve(__dirname), // ${projectRoot}/tests/
);

describe('Profile', () => {
    it('matches snapshot', async () => {
        // compares stored data to a new build
        // will be saved to: ${projectRoot}/tests/__fixtures__/profile.json
        const profile = ProfileFactory.fixtureSync('profile');

        // if the comparison fails, a new fixture will have been saved
        // so the snapshot should (and will) also fail
        expect(profile).toMatchSnapshot();
    });
    // ...
});
```
