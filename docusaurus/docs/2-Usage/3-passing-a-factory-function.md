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

This function will be called with two parameters `values` and `iteration`. Values is an object containing the default
values after these have been parsed. I.e. if you passed a function as the first parameter to the constructor, this
function will be called and its return value will be passed to the factory function. The factory function should return
the final object or a Promise resolving to the final object.
