---
id: factory-schema
title: Factory Schema
description: Factory Schema
slug: /factory-schema
sidebar_label: 'Schema'
sidebar_position: 3
---

Although the above examples of default values use a simple object literal with static values, TypeFactory /
FixtureFactory in fact expect what is called a `FactorySchema` in the code. This is an object that can handle different
types of values - including other factories, functions and generators.

## Using TypeFactory instances in factory schemas

You can place instances of TypeFactory as values:

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

When building an instance of UserFactory, the nested UserProfileFactorys will be built. The decision whether to use the
async or sync build methods depends on what method was called on the containing factory. Thus if the async
UserFactory.build()
is called, then then async UserProfileFactory.build() will be called in the nested factory etc.

## Using the .use static method with nested factories

The caveat of placing an instance of TypeFactory as a `FactorySchema` value is that you cannot pass values to the
sub-factory at build-time. To solve this you can use the `.use` static method, which allows you to pass args:

```typescript title="factories.ts"
const UserProfileFactory = new TypeFactory<UserProfile>({
    profession: 'cook',
    gender: 'male',
    age: 27,
});

const UserFactory = new TypeFactory<User>({
    // ...
    profile: TypeFactory.use<UserProfile>(UserProfileFactory, {
        overrides: (iteration) => ({
            // ...
        }),
        // values: UserProfile, iteration: number
        factory: (values, iteration) => {
            // ...
        },
    }),
    // ...
});
```

You can pass the same kind of options as for [the regular build methods](#building-objects).

If you want to build multiple objects, i.e. to call `.batch` or `.batchSync` for a nested factory, simple pass as part
of the options a `{ batch: number }` key-value pair:

```typescript title="factories.ts"
const UserFactory = new TypeFactory<User>({
    // ...
    profile: TypeFactory.use<UserProfile>(UserProfileFactory, {
        batch: 3,
        overrides: (iteration) => ({...}),
        factory: (values, iteration) => {
            // ...
        },
    })
    // or
    profile: TypeFactory.use<UserProfile>(UserProfileFactory, {
        batch: 3
        //...
    }),
    // or
    profile: TypeFactory.use<UserProfile>(UserProfileFactory, () => ({
        batch: 3
        //...
    })),
});
```

## Using .use with custom functions

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

## Designating a required build-time argument

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

## Designating a property as derived

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

When using derived properties you _must_ provide a factory function that will set the value for all derived properties.
When a derived property is not set, an informative error will be thrown:

````typescript title="factories.ts"
const UserFactory = new TypeFactory<User>({
    profession: TypeFactory.iterate(["linguist", "engineer", "judge"]),
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

## Using Generators

You can place
a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) as a
factory schema value. At build-time, the generator's `.next` method will be called. You should be careful. though, when
doing this: The generator function does not return or yield `{done: true}` during build-time.

There are two built-in convenience static methods that create _infinite_ generators: `.iterate` and `.sample`. Both
methods accept an [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) as a
value, e.g. an Array, Set, Map etc.

**NOTE** do not pass an infinite iterator to these builtin methods: It will create an infinite loop.

### The .iterate method

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
````

### The .sample method

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
