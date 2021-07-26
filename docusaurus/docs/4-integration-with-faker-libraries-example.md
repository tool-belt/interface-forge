---
id: integrating-faker
title: Integrating with FakerJS or ChanceJS
description: Example of FakerJS or ChanceJS factory integration
slug: /integrating-faker
sidebar_label: 'FakerJS Integration'
sidebar_position: 4
---

Integrating faker.js, chance.js and any other similar library in a factory is straightforward:

```typescript
import * as faker from 'faker';
import { TypeFactory } from 'interface-forge';
import { UserProfile, User, Cat } from "./types"

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    birthday: Date
    isActive: boolean;
    imageUrl: string;
}
export const UserFactory = new TypeFactory<User>(() => {
    id: faker.datatype.uuid();
    firstName: faker.name.firstName();
    lastName: faker.name.lastName();
    email: faker.internet.email();
    address: faker.address.streetAddress();
    birthday: faker.date.past()
    isActive: faker.datatype.boolean();
    imageUrl: faker.internet.url();
})
```

Or as part of build args: 

```typescript
const user = UserFactory.buildSync(() => ({
    address: faker.address.streetAddress + ", " + faker.address.zipCode()
}))
```
