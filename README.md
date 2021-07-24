[![GitHub license](https://img.shields.io/github/license/Goldziher/interfaceForge)](https://github.com/Goldziher/interfaceForge/blob/main/LICENSE)
![David](https://img.shields.io/david/Goldziher/interfaceForge)
[![codecov](https://codecov.io/gh/Goldziher/interfaceForge/branch/main/graph/badge.svg?token=1QdttZtggc)](https://codecov.io/gh/Goldziher/interfaceForge)
[![Maintainability](https://api.codeclimate.com/v1/badges/1fe90a85d374b3d38d9c/maintainability)](https://codeclimate.com/github/Goldziher/interfaceForge/maintainability)

Interface-Forge allows you to gracefully generate dynamic mock data and static fixtures in TypeScript.

---

## Installation

```shell
yarn add --dev interface-forge
```

Or

```shell
npm install --save-dev interface-forge
```

## Basic Example

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

Take a look at our [documentation](docs).

## Contributing

Contributions are welcome. Please see the [contributing guide](CONTRIBUTING.md)
