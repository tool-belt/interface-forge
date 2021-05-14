[![codecov](https://codecov.io/gh/Goldziher/interfaceForge/branch/main/graph/badge.svg?token=1QdttZtggc)](https://codecov.io/gh/Goldziher/interfaceForge)

# InterfaceForge

A library to gracefully generate testing data using TypeScript interfaces.

## Creating a Factory

To create a factory you need some TS types, for example:  

```typescript
// types.ts

export interface UserProfile {
    profession: string
    gender: string
    age: number
    birthDay: Date
}

export interface User {
    firstName: string
    lastName: string
    email: string
    profile?: UserProfile
}

```

Then pass the type as a generic argument when creating an instance of InterfaceForge alongside default values: 

```typescript
// some.spec.ts
import { InterfaceForge } from 'interfaceforge';
import { User } from './types';
...

const UserFactory = new InterfaceForge<User>({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
})

describe("some test suite", () => {
    let user: User
    
    beforeEach(async () => {
        user = await UserFactory.build() 
        // user == { firstName: "John", lastName: "Smith", email: "js@example.com" }
    })
})

```

Although the above example of default values is simply an object literal with static values, InterfaceForge can handle more complex schemas:

```typescript
// factories.ts
import { InterfaceForge } from 'interfaceforge';
import { User } from './types';

// object literal defaults with static values

const UserFactory1 = new InterfaceForge<User>({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
})

// object literal defaults with static values

const UserFactory2 = new InterfaceForge<User>({
    firstName: InterfaceForge.iterate(["John", "Bob", "Will", "Mary", "Sue", "Willma"]),
    lastName: "Smith",
    email: "js@example.com",
})

const UserFactory1 = new InterfaceForge<User>(() => ({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
}))

// or async

const UserFactory2 = new InterfaceForge<User>(async () => await new Promise(resolve => resolve({
    firstName: "John",
    lastName: "Smith",
    email: "js@example.com",
})))
```

You can also pass 

### function default

## Default and Build arguments

The interfaceForge constructor receives two arguments:

* `defaults`: this can be either an object literal of values
* `factory`

```typescript
(defaults: FactoryOptions<T>, factory?: FactoryFunction<T>)
```




