---
id: passing-default-values
title: Passing Default Values
description: How to pass default factory values to the interfaceForge
slug: /usage/passing-default-values
---

When creating an instance you **must pass default values** as the first parameter to the constructor. Defaults can be
either an `object`, a `sync function` returning an object, or an `async function` returning a promise resolving to an object:

```typescript title="factories.ts"
import { TypeFactory } from 'interface-forge';
import { User } from './types';

// using an object literal
const UserFactoryWithObjectLiteral = new TypeFactory<User>({
    // ...
});

// using a sync function literal
const UserFactoryWithSyncFunction = new TypeFactory<User>((iteration) => {
    // ...
    return {
        // ... values
    };
});

// using an async function
const UserFactoryWithAsyncFunction = new TypeFactory<User>(
    async (iteration) => {
        // ... async code
        return {
            // ... values
        };
    },
);
```

For further details about what can be inside the defaults object see [Factory Schema](#factory-schema).

:::note Counter
Iteration begins at 0 by default. You can reset the internal counter by calling the `.resetCounter` method. If you wish
to begin iteration at a value other than 0, you can pass this value as a parameter to `.resetCounter`.
:::
