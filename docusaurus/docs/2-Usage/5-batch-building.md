---
id: batch-building 
title: Batch Building 
description: How to build batches of objects with a factory 
slug: /usage/batch-building
---

If you need to generate multiple objects at the same time, you can use either the `.batch` or `.batchSync` methods. The
difference between the two is that `.batch` is async while `.batchSync` is not. Thus `.batch` returns a promise
resolving to an array of objects of the given type, and `.batchSync` returns the array directly.

Both methods accept two parameters:

- `size`: the number of objects to create - this is a **required** parameter.
- `options`: the same as for [the regular build methods](#building-objects).

```typescript title="User.spec.ts"
describe('User', () => {
    const user = UserFactory.batchSync(3)
    
    // or using async
    let users: User[];
    beforeEach(async () => {
        // you can pass override values when calling build
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
```
