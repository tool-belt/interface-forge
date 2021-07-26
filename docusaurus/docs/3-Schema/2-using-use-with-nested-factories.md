---
id: using-the-use-static-method-with-nested-factories 
title: Using the .use static method with nested factories
description: Using the .use static method with nested factories 
slug: /factory-schema/using-the-use-static-method-with-nested-factories
---

The caveat of placing an instance of TypeFactory as a `FactorySchema` value is that you cannot pass build-args to the
sub-factory at build-time. To solve this you can use the `.use` static method, which allows you to pass args:

```typescript title="factories.ts"
const UserProfileFactory = new TypeFactory<UserProfile>({
    profession: 'cook',
    gender: 'male',
    age: 27,
});

const UserFactory = new TypeFactory<User>({
    // ...
    profile: TypeFactory.use<UserProfile>(UserProfileFactory, {
        overrides: (iteration) => ({
            // ...
        }),
        // values: UserProfile, iteration: number
        factory: (values, iteration) => {
            // ...
        },
    }),
    // ...
});
```

You can pass the same kind of options as for [the regular build methods](#building-objects).

If you want to build multiple objects, that is, to call `.batch` or `.batchSync` for a nested factory, simply pass
a `{ batch: number }` key-value pair as part of the options object:

```typescript title="factories.ts"
const UserFactory = new TypeFactory<User>({
    // ...
    profile: TypeFactory.use<UserProfile>(UserProfileFactory, {
        batch: 3,
        overrides: (iteration) => ({ ... }),
        factory: (values, iteration) => {
            // ...
        },
    })
    // or
    profile: TypeFactory.use<UserProfile>(UserProfileFactory, {
        batch: 3
        //...
    }),
    // or
    profile: TypeFactory.use<UserProfile>(UserProfileFactory, () => ({
        batch: 3
        //...
    })),
});
```
