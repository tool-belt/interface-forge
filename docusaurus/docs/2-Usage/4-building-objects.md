---
id: building-objects 
title: Building Objects 
description: How to build objects using interfaceForge factories 
slug: /usage/building-objects
---

To use the factory to generate an object you should call either `.build` or `.buildSync`. The difference between these
two methods is that `.build` is async while `.buildSync` is not:

```typescript title="User.spec.ts"
describe('User', () => {
    const user = UserFactory.buildSync()
    
    // or using async
    let user: User
    beforeEach(async () => {
        user = await UserFactory.build()
    });
    // ...
});
```

You can override a factory's default values by passing values when calling the build method:

```typescript title="User.spec.ts"
describe('User', () => {
    const user = UserFactory.buildSync({ firstName: "George" })
    
    // or a function:
    const user = UserFactory.buildSync((iteration) => ({ firstName: "George" + " " + iteration.toString() }))
    
    // or using async
    let user: User
    beforeEach(async () => {
        user = await UserFactory.build({ firstName: "George" })
    });
});
```

Overrides can take the same form as the defaults passed to a factory, that is, the overrides can be an `object`, or
a `sync` / `async` function returning such and object. The overrides object will be merged with the factory's defaults,
overriding values as required.

Alternatively, if you need to also provide a factory function when calling the factory, you can pass options as an
object with two (optional) keys:

- `overrides`: same as described above.
- `factory function`: a [factory function](#passing-a-factory-function), which will be used instead of any factory
  function passed when initializing the factory (if any).

```typescript title="User.spec.ts"
describe('User', () => {
    const user = UserFactory.buildSync({
        overrides: () => ({ ... }),
        factory: (values, iteration) => {
            // ...
        }
    })
    // or using async
    let user: User
    beforeEach(async () => {
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
});
```

:::note Synch/Async
If you call `.buildSync` or `.batchSync` on a factory that has been initialized with async defaults, or while passing
async overrides / factory function to the method, an informative error will be thrown.
:::
