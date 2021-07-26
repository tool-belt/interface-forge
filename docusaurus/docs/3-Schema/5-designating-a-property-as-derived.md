---
id: designating-a-property-as-derived
title: Designating a property as derived
description: Designating a property as derived
slug: /factory-schema/designating-a-property-as-derived
---

Sometimes its desirable to derive a given property's value from the build result itself rather than from defaults or
build time arguments. In such cases you can designate a property as derived by calling the eponymous method `.derived`:

```typescript title="factories.ts"
const UserFactory = new TypeFactory<User>(
    {
        profession: TypeFactory.iterate(['linguist', 'engineer', 'judge']),
        salutation: TypeFactory.derived(),
        // ...
    },
    (value) => ({
        ...value,
        salutation:
            value.profession === 'linguist'
                ? 'Dr.'
                : value.profession === 'engineer'
                ? 'Eng.'
                : 'Hon.',
    }),
);
```

When using derived properties you **must** provide a factory function that will set the value for all derived properties.
If, after any user provided factory function has been called, a derived property is still not set, an informative error will be thrown:

```typescript title="factories.ts"
const UserFactory = new TypeFactory<User>({
    profession: TypeFactory.iterate(['linguist', 'engineer', 'judge']),
    salutation: TypeFactory.derived(),
    // ...
});

describe('User', () => {
    let user: User;

    beforeEach(async () => {
        user = await UserFactory.build();
        // Error: [interface-forge] missing derived parameters: salutation
    });
    // ...
});
```
