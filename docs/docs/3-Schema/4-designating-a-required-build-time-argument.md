---
id: designating-a-required-build-time-argument
title: Designating a required build-time argument
description: Designating a required build-time argument
slug: /factory-schema/designating-a-required-build-time-argument
---

Sometimes its desirable to designate a property as an argument that must be supplied at build-time. To do this simply
call the `.required` static method for each required property:

```typescript title="factories.ts"
const UserFactory = new TypeFactory<User>({
    firstName: TypeFactory.required(),
    lastName: TypeFactory.required(),
    // ...
});

describe('User', () => {
    let user: User;

    beforeEach(async () => {
        user = await UserFactory.build();
        // Error: [interface-forge] missing required build arguments: firstName, lastName
        // To avoid an error:
        // user = await UserFactory.build({ firstName: "Moishe", lastName: "Zuchmir" });
    });
    // ...
});
```
