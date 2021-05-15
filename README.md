[![GitHub license](https://img.shields.io/github/license/Goldziher/interfaceForge)](https://github.com/Goldziher/interfaceForge/blob/main/LICENSE)
![David](https://img.shields.io/david/Goldziher/interfaceForge)
[![codecov](https://codecov.io/gh/Goldziher/interfaceForge/branch/main/graph/badge.svg?token=1QdttZtggc)](https://codecov.io/gh/Goldziher/interfaceForge)
[![Maintainability](https://api.codeclimate.com/v1/badges/1fe90a85d374b3d38d9c/maintainability)](https://codeclimate.com/github/Goldziher/interfaceForge/maintainability)

InterfaceForge allows you to gracefully generate test data using TypeScript.

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
    profession: string
    gender: string
    age: number
}

export interface User {
    firstName: string
    lastName: string
    email: string
    profile: UserProfile
}

```

Then pass the type as a generic argument when creating an instance of InterfaceForge alongside default values:

```typescript
// factories.ts
import { InterfaceForge } from 'interface-forge';
import { User } from './types';

const UserFactory = new InterfaceForge<User>({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
    profile: {
        profession: "cook",
        gender: "male",
        age: 27
    }
})
```

Then use the factory to create an object of the desired type in a test file:

```typescript
// User.spec.ts

describe("User", () => {
    let user: User

    beforeEach(async () => {
        // you can pass override values when calling build
        user = await UserFactory.build({
            firstName: "Johanne",
            profile: {
                profession: "Journalist",
                gender: "Female",
                age: 31
            }
        })
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
    })
    // ...
})
```

</details>

### Passing default values

When creating an InterfaceForge instance you must pass default values as the first *required parameter* to the
constructor. Default values can be either an object literal, a sync function returning an object literal, or an async
function returning a promise resolving to an object literal:

```typescript
// factories.ts
import { InterfaceForge } from 'interface-forge';
import { User } from './types';

// using an object literal
const UserFactoryWithObjectLiteral = new InterfaceForge<User>({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
    profile: {
        profession: "cook",
        gender: "male",
        age: 27
    }
})

// using a sync function literal
const UserFactoryWithSyncFunction = new InterfaceForge<User>(() => ({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
    profile: {
        profession: "cook",
        gender: "male",
        age: 27
    }
}))

// using an async function
const UserFactoryWithAsyncFunction = new InterfaceForge<User>(async () => Promise.resolve({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
    profile: {
        profession: "cook",
        gender: "male",
        age: 27
    }
}))
```

For further details about what can placed inside the defaults object see [_Factory Schema_](#factory-schema).

### Passing a Factory Function

You can also pass a second optional parameter to the InterfaceForge constructor which is a factory function with the
following signature::

```typescript
type FactoryFunction<T> = (values: T, iteration: number) => T | Promise<T>
```

This function will be called with two parameters `values` and optionally `iteration` (iteration is passed only when
building a batch). Values is an object containing the default values after these have been parsed. I.e. if you passed a
function as the first parameter to the constructor, this function will be called and its return value will be passed to
the factory function. The factory function should return the final object or a Promise resolving to the final object.

**NOTE**: Iteration begins at 0.

### The .build method

To use the factory to generate an object you should call `.build`. This method is `async` - so it has to be awaited.
The `.build` method accepts three optional parameters:

- `overrides`: either an object literal, a function returning an object literal, or a promise resolving to an object
  literal. The values of the object are merged with the defaults using `Object.assign` - hence newer values passed in
  the overrides literally "override" the values stored in the defaults passed through the constructor.

- `factory function`: a [factory function](#passing-a-factory-function). If a factory function was passed to the
  constructor, and a factory function is passed as a parameter to `.build`, the function passed as a parameter is used.

- `iteration`: a number representing the current iteration. This parameter is used internally when calling `.batch`,
  otherwise it is default 0 every time calling `.build`.

<details>
  <summary>Click to expand!</summary>

```typescript
describe("User", () => {
    let user: User

    beforeEach(async () => {
        // you can pass override values when calling build
        user = await UserFactory.build(async () => Promise.resolve({
            firstName: "Johanne",
            profile: {
                profession: "Journalist",
                gender: "Female",
                age: 31
            }
        }), (values: User) => {
            // do something
        })
    })
    // ...
})

```

</details>

### The .batch method

If you need to generate multiple objects at the same time, you can use the `.batch` method. This method is also `async`,
and it returns a promise resolving to an array of objects of the given type. It accepts the following parameters:

- `sizte`: the number of objects to create - this is a *required parameter*.
- `overrides`: the same as for [`.build`](#the-build-method)
- `factory function`: the same as for [`.build`](#the-build-method) with the exception that iteration will be
  incremented for each object being built.

<details>
  <summary>Click to expand!</summary>

```typescript
describe("User", () => {
    let users: User[]

    beforeEach(async () => {
        // you can pass override values when calling build
        users = await UserFactory.batch(3, async () => Promise.resolve({
            firstName: "Johanne",
            profile: {
                profession: "Journalist",
                gender: "Female",
                age: 31
            }
        }), (values: User, iteration) => {
            values.profile.age += iteration
            return values
        })
        // each user now has a different age
    })
    // ...
})

```

</details>

## Factory Schema

Although the above example of default values is simply an object literal with static values, InterfaceForge in fact
expects what is called a `FactorySchema` in the code. This is an object that can handle different types of values -
including other instances of InterfaceForge, bound functions and generators.

### Using InterfaceForge instances in factory schemas

You can place instances of InterfaceForge as values:

```typescript
// factories.ts
import { InterfaceForge } from 'interface-forge';
import { User, UserProfile } from './types';

const UserProfileFactory = new InterfaceForge<UserProfile>({
    profession: "cook",
    gender: "male",
    age: 27
})

const UserFactory = new InterfaceForge<User>({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
    profile: UserProfileFactory
})
```

The sub-factory's build method will be called.

### Using the .use static method

The caveat of placing an instance of InterfaceForce as a `FactorySchema` value is that you cannot pass values to the
sub-factory when `.build` is called. To solve this you can use the `.use` static method, which allows you to pass args
at build-time:

```typescript
const UserProfileFactory = new InterfaceForge<UserProfile>({
    profession: "cook",
    gender: "male",
    age: 27
})

const UserFactory1 = new InterfaceForge<User>({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
    profile: InterfaceForge.use(UserProfileFactory, {
        profession: "Librarian",
        gender: "Other",
        age: "41"
    })
})

const UserFactory2 = new InterfaceForge<User>({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
    profile: InterfaceForge.use(UserProfileFactory, () => ({
        profession: "Librarian",
        gender: "Other",
        age: "41"
    }))
})


const UserFactory3 = new InterfaceForge<User>({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
    profile: InterfaceForge.use(UserProfileFactory, async () => Promise.resolve({
        profession: "Librarian",
        gender: "Other",
        age: "41"
    }))
})
```

You can pass both an overrides object or function, and a factory function, exactly as you would when calling
the `.build` method on the factory directly.

### the .iterate method

Use the `iterate` static method to create an (infinite) iterator. Each time the `.build` method is called, the iterator
will yield the next value in the array. When reaching the array's end, iteration will begin from position 0 again:

```typescript

//  
const UserFactory = new InterfaceForge<User>({
    firstName: InterfaceForge.iterate(["John", "Bob", "Will", "Mary", "Sue", "Willma"]),
    lastName: "Smith",
    email: "js@example.com",
    profile: {
        profession: "cook",
        gender: "male",
        age: 27
    }
})

describe("User", () => {
    let user1: User
    let user2: User

    beforeEach(async () => {
        user1 = await UserFactory.build({})
        // user == {
        //     firstName: "John",
        //     ...
        // }
        user2 = await UserFactory.build({})
        // user == {
        //     firstName: "Bob",
        //     ...
        // }
    })
    // ...
})
```
