---
id: using-generators
title: Using Generators
description: Using Generators
slug: /factory-schema/using-generators
---

You can place
a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) as a
factory schema value. At build-time, the generator's `.next` method will be called. You should be careful. though, when
doing this: The generator function does not return or yield `{done: true}` during build-time.

There are two built-in convenience static methods that create _infinite_ generators: `.iterate` and `.sample`. Both
methods accept an [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) as a
value, e.g. an Array, Set, Map etc.

**NOTE** do not pass an infinite iterator to these builtin methods: It will create an infinite loop.

## The .iterate method

Use the `iterate` static method to create an infinite iterator that yields the values passed to it serially. Each
time `.next` is called, the next value in the iterator is returned. When reaching the iterator's end, iteration will
begin from position 0 again:

```typescript title="factories.ts"
const UserFactory = new TypeFactory<User>({
    firstName: TypeFactory.iterate(['John', 'Bob']),
    // ...
});

describe('User', () => {
    let user1: User;
    let user2: User;

    beforeEach(async () => {
        user1 = await UserFactory.build();
        // user == {
        //     firstName: "John",
        //     ...
        // }
        user2 = await UserFactory.build();
        // user == {
        //     firstName: "Bob",
        //     ...
        // }
        user3 = await UserFactory.build();
        // user == {
        //     firstName: "John",
        //     ...
        // }
    });
    // ...
});
```

## The .sample method

Use the `sample` static method to create an infinite iterator that returns a random value each time its called. If the
iterator contains more than one item, the current and previous values are guaranteed to be different.

```typescript title="factories.ts"
const UserFactory = new TypeFactory<User>({
    firstName: TypeFactory.sample([
        'John',
        'Bob',
        'Will',
        'Mary',
        'Sue',
        'Willma',
    ]),
    // ...
});

describe('User', () => {
    let user1: User;
    let user2: User;

    beforeEach(async () => {
        user1 = await UserFactory.build();
        // user == {
        //     firstName: "Sue",
        //     ...
        // }
        user2 = await UserFactory.build();
        // user == {
        //     firstName: "Will",
        //     ...
        // }
    });
    // ...
});
```
