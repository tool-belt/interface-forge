---
id: using-the-use-static-method-with-custom-functions
title: Using the .use static method with custom functions
description: Using the .use static method with custom functions
slug: /factory-schema/using-the-use-static-method-with-custom-functions
---

The `.use` method also allows you to pass any `sync` or `async` function for a schema value. The function will be called
at build time with the current iteration of the factory:

```typescript title="factories.ts"
import { TypeFactory } from './type-factory';
import faker from 'faker';

const UserFactory = new TypeFactory<User>({
    // ...
    profile: {
        // ...
        profession: TypeFactory.use((iteration): string => {
            if (iteration % 2 === 0) {
                return 'cook';
            } else {
                return 'librarian';
            }
        }),
    },
});
```
