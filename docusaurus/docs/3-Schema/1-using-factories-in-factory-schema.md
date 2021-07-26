---
id: using-factories-in-factory-schema 
title: Using Factories in Factory-Schema
description: Using other factories as values in factory schema. 
slug: /factory-schema/using-factories-in-factory-schema
---

You can place other factories within a factory schema. These will be used of TypeFactory as values:

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

When building an instance of UserFactory, the nested UserProfileFactory will be built. The decision whether to use
the `async` or `sync` build methods depends on the method invoked on the parent factory. You must therefore be careful
not to place a factory initiated with async defaults as a child attribute in a factory that is meant to be used
synchronously.
