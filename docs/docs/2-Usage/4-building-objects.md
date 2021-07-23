---
id: building-objects
title: Building Objects
description: How to build objects using interfaceForge factories
slug: /usage/building-objects
---

To use the factory to generate an object you should call either `.build` or `.buildSync`. The difference between the two
is that `.build` is async while `.buildSync` is not. You can pass options to the build method - these can either be an
object containing key-value pairs that (partially) override the defaults with which the factory was initialized, a
function or async function returning such overrides, or an object with two optional keys:

- `overrides`: either an object literal, a function returning an object literal, or a promise resolving to an object
    literal. The values of the object are merged with the defaults using `Object.assign` - hence newer values passed in
    the overrides literally "override" the values stored in the defaults passed through the constructor.

- `factory function`: a [factory function](#passing-a-factory-function). If a factory function was passed to the
    constructor, and a factory function is passed as a parameter to `.build`, the function passed as a parameter is used.

```typescript title="User.spec.ts"
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
