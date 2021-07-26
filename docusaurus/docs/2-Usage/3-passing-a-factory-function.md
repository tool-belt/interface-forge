---
id: passing-a-factory-function 
title: Passing a Factory Function 
description: How to use factory functions 
slug: /usage/passing-a-factory-function
---

You can also pass a second optional parameter to the TypeFactory constructor which is a factory function with the
following signature:

```typescript
type FactoryFunction<T> = (values: T, iteration: number) => T | Promise<T>;
```

This function will be called with two parameters `values` and `iteration`. Values is an object containing the factory's
default values after these have been parsed and merged with any args passed when calling one of the build methods.
values after these have been parsed. The factory function should return the final object, or a Promise resolving to the
final object returned by the factory.
