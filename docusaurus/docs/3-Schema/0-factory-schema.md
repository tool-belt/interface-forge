---
id: factory-schema 
title: FactorySchema 
description: The FactorySchema 
object slug: /factory-schema
---

When passing default values and overrides, TypeFactory and its subclasses expect what is referred to as `FactorySchema`
object in the code. A FactorySchema is an object that can include different types of values, including other factories,
generator functions, factory functions and some builtin helpers:

```typescript title="types.ts"
type FactorySchema<T> = {
    [K in keyof T]: T[K] extends CallableFunction
        ? T[K]
        :
              | T[K]
              | Promise<T[K]>
              | Ref<T[K]>
              | TypeFactory<T[K]>
              | Generator<T[K], T[K], T[K]>
              | BuildArgProxy;
};
```
