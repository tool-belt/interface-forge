---
id: creating-and-using-fixtures
title: Creating and using Fixtures
description: How to create static factory builds
slug: /usage/creating-and-using-fixtures
---

To use the package to generate fixtures you can simply import `FixtureFactory` instead of `TypeFactory`. The fixture class extends TypeFactory with four additional methods, which allow you to save static builds of a factory to your disk. This can be helpful where you don't want the result of a build to change everytime it runs (i.e. when snapshot testing). The methods' naming corresponds to the respective build method: `.fixture`, `.fixtureSync`, `.fixtureBatch`, `.fixtureBatchSync`.

The FixtureFactory's methods require a file name (or file path) as the first parameter. You can also designate a default path for all of a factory's builds, by passing a third parameter to the constructor. The file names will then be appended to this designated default path, instead.

:::note file path
Whether using a default fixture path, or not: The **file path must be absolute**, or else interface-forge will throw an error.
:::

## Without default File Path

```typescript title="${projectRoot}/tests/User.spec.ts"
import { FixtureFactory } from 'interface-forge';
import { User } from '../types';

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
```

## With default File Path

```typescript title="${projectRoot}/tests/Profile.spec.ts"
import { FixtureFactory } from 'interface-forge';
import { Profile } from '../types';

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
