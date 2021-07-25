---
id: using-typefactory-instances-in-factory-schemas
title: Using TypeFactory instances in Factory Schemas
description: Using TypeFactory instances in Factory Schemas
slug: /factory-schema/using-typefactory-instances-in-factory-schemas
---

Although the previous usage examples of default values use a simple object literal with static values, TypeFactory /
FixtureFactory in fact expect what is called a `FactorySchema` in the code.

:::info

`FactorySchema` is an object that can handle different
types of values - including **other factories, functions and generators!**

:::

You can place instances of TypeFactory as values:

```typescript title="factories.ts"
import { TypeFactory } from 'interface-forge';
import { User, UserProfile } from './types';

const UserProfileFactory = new TypeFactory<UserProfile>({
    profession: 'cook',
    gender: 'male',
    age: 27,
});

const UserFactory = new TypeFactory<User>({
    firstName: 'John',
    lastName: 'Smith',
    email: 'js@example.com',
    profile: UserProfileFactory,
    cats: [],
});
```

When building an instance of UserFactory, the nested UserProfileFactorys will be built. The decision whether to use
the async or sync build methods depends on what method was called on the containing factory. Thus if the async
UserFactory.build()
is called, then then async UserProfileFactory.build() will be called in the nested factory etc.
