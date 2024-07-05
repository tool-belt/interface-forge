# Interface-Forge

Interface-Forge is a TypeScript library for creating strongly typed mock data factories. This library builds upon [Faker.js](https://fakerjs.dev/) by providing a simple and intuitive `Factory` class that extends the `Faker` class from [Faker.js](https://fakerjs.dev/).

## Installation

```shell
npm install --save-dev interface-forge
```

## Basic Example

To create a factory, you need a TypeScript type:

```typescript
// types.ts

interface User {
    firstName: string;
    lastName: string;
    email: string;
    profile: {
        profession: string;
        gender: string;
        age: number;
    };
}
```

Pass the desired type as a generic argument when instantiating the `Factory` class, alongside default values for the factory:

```typescript
// factories.ts
import { Factory } from 'interface-forge';
import { User } from './types';

const UserFactory = new Factory<User>((factory, iteration) => ({
    firstName: factory.person.firstName(),
    lastName: factory.person.lastName(),
    email: factory.internet.email(),
    profile: {
        profession: factory.person.jobType(),
        gender: factory.person.gender(),
        age: 27 + iteration,
    },
}));
```

Then use the factory to create an object of the desired type in a test file:

```typescript
// User.spec.ts

describe('User', () => {
    const user = UserFactory.build();
    // user == {
    //     firstName: "Johanne",
    //     lastName: "Smith",
    //     email: "js@example.com",
    //     profile: {
    //         profession: "Journalist",
    //         gender: "Female",
    //         age: 27
    //     },
    // }
    // ...
});
```

## Factory Class Methods

### `build`

Builds a single object based on the factory's schema. Optionally, you can pass an object to override specific properties.

**Usage:**

```typescript
const user = UserFactory.build();
// user == {
//     firstName: "Johanne",
//     lastName: "Smith",
//     email: "js@example.com",
//     profile: {
//         profession: "Journalist",
//         gender: "Female",
//         age: 27
//     },
// }

const customUser = UserFactory.build({ age: 35 });
// customUser.age == 35
```

### `batch`

Generates a batch of objects based on the factory's schema. Optionally, you can pass an object or an array of objects to override specific properties for each instance.

**Usage:**

```typescript
const users = UserFactory.batch(3);
// users == [
//     { ... },
//     { ... },
//     { ... }
// ]

const customUsers = UserFactory.batch(3, { age: 35 });
// customUsers == [
//     { ..., age: 35 },
//     { ..., age: 35 },
//     { ..., age: 35 }
// ]

const variedUsers = UserFactory.batch(3, [
    { age: 30 },
    { age: 25 },
    { age: 40 },
]);
// variedUsers == [
//     { ..., age: 30 },
//     { ..., age: 25 },
//     { ..., age: 40 }
// ]
```

### `use`

Creates a reference to a function that can be used within the factory. This method allows for the encapsulation of a function and its arguments, enabling deferred execution.

**Usage:**

```typescript
const complexFactory = new Factory<ComplexObject>((factory) => ({
    name: factory.person.firstName(),
    value: factory.number.int({ min: 1, max: 3 }),
    options: {
        type: '1',
    },
}));

const factoryWithOptions = new Factory<ComplexObject>((factory) => ({
    ...defaults,
    options: {
        type: '1',
        children: factory.use(complexFactory.batch, 2),
    },
}));

const result = factoryWithOptions.build();
// result.options.children == [
//     { ... },
//     { ... }
// ]
```

### `iterate`

Cycles through the values of an iterable indefinitely.

**Usage:**

```typescript
const values = ['Value 1', 'Value 2', 'Value 3'];
const generator = UserFactory.iterate(values);

console.log(generator.next().value); // 'Value 1'
console.log(generator.next().value); // 'Value 2'
console.log(generator.next().value); // 'Value 3'
console.log(generator.next().value); // 'Value 1'
```

### `sample`

Samples values randomly from an iterable, ensuring no immediate repetitions.

**Usage:**

```typescript
const values = [1, 2, 3];
const generator = UserFactory.sample(values);

console.log(generator.next().value); // 1 (or 2, or 3)
console.log(generator.next().value); // (different from the previous value)
```

## Contributing

Contributions of any kind are welcome! Please see the [contributing guide](CONTRIBUTING.md).
