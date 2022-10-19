---
id: basic-example
title: Basic Example
description: Basic usage examples
slug: /usage/basic-example
---

To create a factory you need some TS types:

```typescript title="types.ts"
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

Pass the desired type as a generic argument when instantiating TypeFactory alongside default values for the factory:

```typescript title="factories.ts"
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

Then use the factory to create an object of the desired type:

```typescript title="User.spec.ts"
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

## Browser Usage

The `TypeFactory` class can be used in the browser (whereas the `FixtureFactory` class cannot).
For webpack, the following lines need to be added to your config:

```typescript title="webpack.config.ts (excerpt)"
    resolve: {
        // …,
        fallback: {
            fs: false,
            path: false,
        },
    },
```
