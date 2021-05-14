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

### Passing a Factory Function

You can also pass a factory function - `sync` or `async`, as required - when creating an instance with the following
signature:

```typescript
type FactoryFunction<T> = (values: T, iteration: number) => T | Promise<T>
```

This function will be called with two parameters `values` and `iteration` when `.build` is called. Values is an object
containing the default values after these have been parsed. The factory function should return the final object or a Promise resolving to
the final object.

---
**NOTE**: Iteration begins at 1 not 0. Iteration is the current iteration of the factory - it is
incremented everytime `.build` is called.
---

## Factory Schema

Although the above example of default values is simply an object literal with static values, InterfaceForge in fact
expects what is called a "FactorySchema". This is an object that can handle different types of values - including other
instances of InterfaceForge, bound functions and generators.

### sub-factories

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

### the .bind method

The caveat of placing an instance of InterfaceForce as a `FactorySchema` value is that you cannot pass values to the
sub-factory when `.build` is called. To solve this you can use the `.bind` method, which allows you to pass args at
build-time:

```typescript
const UserProfileFactory = new InterfaceForge<UserProfile>({
    profession: "cook",
    gender: "male",
    age: 27
})

const UserFactory = new InterfaceForge<User>({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
    profile: InterfaceForge.bind(UserProfileFactory, {
        profession: "Librarian",
        gender: "Other",
        age: "41"
    })
})

```

### the .iterate method

Use the `iterate` static method to create an (infinite) iterator. Each time the .build method is called, the iterator
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
