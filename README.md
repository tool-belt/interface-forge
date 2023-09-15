<div align="center">

![NPM](https://img.shields.io/npm/l/interface-forge)

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Goldziher_interface-forge&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Goldziher_interface-forge)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Goldziher_interface-forge&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=Goldziher_interface-forge)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Goldziher_interface-forge&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Goldziher_interface-forge)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Goldziher_interface-forge&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Goldziher_interface-forge)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=Goldziher_interface-forge&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=Goldziher_interface-forge)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Goldziher_interface-forge&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Goldziher_interface-forge)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Goldziher_interface-forge&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Goldziher_interface-forge)

[![All Contributors](https://img.shields.io/github/all-contributors/tool-belt/interface-forge?color=ee8449&style=flat-square)](#contributors)

</div>

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

Take a look at our [documentation](https://goldziher.github.io/interface-forge/) or read
the [introduction article](https://javascript.plainenglish.io/generating-test-data-and-fixtures-with-interface-forge-5a5548233aa5)
.

## Contributing & Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/nhirschfeld/"><img src="https://avatars.githubusercontent.com/u/30733348?v=4?s=100" width="100px;" alt="Na'aman Hirschfeld"/><br /><sub><b>Na'aman Hirschfeld</b></sub></a><br /><a href="https://github.com/tool-belt/interface-forge/commits?author=Goldziher" title="Code">💻</a> <a href="https://github.com/tool-belt/interface-forge/commits?author=Goldziher" title="Documentation">📖</a> <a href="#maintenance-Goldziher" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dkress59"><img src="https://avatars.githubusercontent.com/u/28515387?v=4?s=100" width="100px;" alt="Damian"/><br /><sub><b>Damian</b></sub></a><br /><a href="https://github.com/tool-belt/interface-forge/commits?author=dkress59" title="Code">💻</a> <a href="https://github.com/tool-belt/interface-forge/commits?author=dkress59" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/stuikomma"><img src="https://avatars.githubusercontent.com/u/2040603?v=4?s=100" width="100px;" alt="Yannis Kommana"/><br /><sub><b>Yannis Kommana</b></sub></a><br /><a href="https://github.com/tool-belt/interface-forge/commits?author=stuikomma" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/ghalibansari"><img src="https://avatars.githubusercontent.com/u/20482230?v=4?s=100" width="100px;" alt="Ghalib Ansari"/><br /><sub><b>Ghalib Ansari</b></sub></a><br /><a href="https://github.com/tool-belt/interface-forge/commits?author=ghalibansari" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification.
Contributions of any kind welcome! Please see the [contributing guide](CONTRIBUTING.md).
