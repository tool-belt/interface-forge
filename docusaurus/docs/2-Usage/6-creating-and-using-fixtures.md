---
id: creating-and-using-fixtures 
title: Creating and using Fixtures 
description: How to create static factory builds
slug: /usage/creating-and-using-fixtures
---

Interface Forge allows you to generate fixtures. This is useful when you do not want the result of a build to change
with every run, for example when snapshot testing frontend components.

To generate fixtures you should instantiate your factory using the `FixtureFactory` class instead of `TypeFactory`,
which extends TypeFactory with four additional methods that allow you to save builds as fixtures: `.fixture`
, `.fixtureSync`, `.fixtureBatch`, `.fixtureBatchSync`. The methods' naming corresponds with their respective build
method, and are thus also respectively sync/async.

The FixtureFactory's methods require a file name or file path as the first parameter:

```typescript title="${projectRoot}/tests/User.spec.ts"
import { FixtureFactory } from 'interface-forge';
import { User } from '../types';

const UserFactory = new FixtureFactory<User>({
    // ...
});

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

You can also designate a default path for all of a factory's builds by passing a third parameter to the constructor. The
file names or paths will then be appended to the designated default path:

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

:::note 
A file path **must be** an absolute path, otherwise an informative error will be thrown.
:::
