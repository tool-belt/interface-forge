import { ComplexObject } from './test-types';
import { ERROR_MESSAGES, TypeFactory } from '../src';

const typeOptions = ['1', '2', '3', 'all', 'none'];

const defaults: ComplexObject = {
    name: 'testObject',
    value: null,
};

describe('.build', () => {
    it('builds correctly with defaults object literal', async () => {
        const factory = new TypeFactory<ComplexObject>(defaults);
        expect(await factory.build()).toStrictEqual<ComplexObject>(defaults);
    });
    it('builds correctly with defaults function', async () => {
        const factory = new TypeFactory<ComplexObject>(() => ({
            ...defaults,
            value: 99,
        }));
        expect(await factory.build()).toStrictEqual<ComplexObject>({
            ...defaults,
            value: 99,
        });
    });
    it('builds correctly with builder function', async () => {
        const factory = new TypeFactory<ComplexObject>(
            defaults,
            (defaults, iteration) => ({
                ...defaults,
                name: 'newObject',
                value: iteration + 1,
            }),
        );
        expect(await factory.build()).toStrictEqual<ComplexObject>({
            ...defaults,
            name: 'newObject',
            value: 1,
        });
    });
    it('merges options correctly when passed object literal', async () => {
        const factory = new TypeFactory<ComplexObject>(defaults);
        expect(
            await factory.build({ name: 'newObject' }),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            name: 'newObject',
        });
    });
    it('merges options correctly when passed object literal in overrides key', async () => {
        const factory = new TypeFactory<ComplexObject>(defaults);
        expect(
            await factory.build({ overrides: { name: 'newObject' } }),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            name: 'newObject',
        });
    });
    it('merges options correctly when passed options function', async () => {
        const factory = new TypeFactory<ComplexObject>(defaults);
        expect(
            await factory.build({
                overrides: () => ({ name: 'newObject' }),
            }),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            name: 'newObject',
        });
    });
    it('merges options correctly when passed options async function', async () => {
        const factoryOne = new TypeFactory<ComplexObject>(defaults);
        const factoryTwo = new TypeFactory<ComplexObject>(async () => {
            return await factoryOne.build();
        });
        expect(
            await factoryTwo.build({
                overrides: async () => Promise.resolve({ name: 'newObject' }),
            }),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            name: 'newObject',
        });
    });
});

describe('.buildSync', () => {
    it('builds correctly with defaults object literal', () => {
        const factory = new TypeFactory<ComplexObject>(defaults);
        expect(factory.buildSync()).toStrictEqual<ComplexObject>(defaults);
    });
    it('builds correctly with defaults function', () => {
        const factory = new TypeFactory<ComplexObject>(() => ({
            ...defaults,
            value: 99,
        }));
        expect(factory.buildSync()).toStrictEqual<ComplexObject>({
            ...defaults,
            value: 99,
        });
    });
    it('builds correctly with builder function', () => {
        const factory = new TypeFactory<ComplexObject>(
            defaults,
            (defaults, iteration) => ({
                ...defaults,
                name: 'newObject',
                value: iteration + 1,
            }),
        );
        expect(factory.buildSync()).toStrictEqual<ComplexObject>({
            ...defaults,
            name: 'newObject',
            value: 1,
        });
    });
    it('merges options correctly when passed object literal', () => {
        const factory = new TypeFactory<ComplexObject>(defaults);
        expect(
            factory.buildSync({ name: 'newObject' }),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            name: 'newObject',
        });
    });
    it('merges options correctly when passed object literal in overrides key', () => {
        const factory = new TypeFactory<ComplexObject>(defaults);
        expect(
            factory.buildSync({ overrides: { name: 'newObject' } }),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            name: 'newObject',
        });
    });
    it('merges options correctly when passed options function', () => {
        const factory = new TypeFactory<ComplexObject>(defaults);
        expect(
            factory.buildSync({
                overrides: () => ({ name: 'newObject' }),
            }),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            name: 'newObject',
        });
    });
    it('throws when called with Promise defaults', () => {
        const factory = new TypeFactory<ComplexObject>(async () =>
            Promise.resolve(defaults),
        );
        expect(() => factory.buildSync()).toThrow(
            ERROR_MESSAGES.PROMISE_DEFAULTS,
        );
    });
    it('throws when called with Promise options', () => {
        const factory = new TypeFactory<ComplexObject>(defaults);
        expect(() =>
            factory.buildSync({
                overrides: async () => Promise.resolve({ name: 'newObject' }),
            }),
        ).toThrow(ERROR_MESSAGES.PROMISE_OVERRIDES);
    });
    it('throws when called with Promise returning factory', () => {
        const factory = new TypeFactory<ComplexObject>(defaults);
        expect(() =>
            factory.buildSync({
                factory: async (value) =>
                    Promise.resolve({ ...value, name: 'newObject' }),
            }),
        ).toThrow(ERROR_MESSAGES.PROMISE_FACTORY);
    });
});

describe('.batch', () => {
    it('returns an array of unique objects', async () => {
        const factory = new TypeFactory<ComplexObject>(
            {
                ...defaults,
                options: {
                    type: TypeFactory.iterate(typeOptions),
                },
            },
            (defaults, iteration) => ({
                ...defaults,
                value: iteration,
            }),
        );
        const result = await factory.batch(5);
        expect(result).toBeInstanceOf(Array);
        expect(result.map(({ value }) => value)).toEqual([0, 1, 2, 3, 4]);
        expect(result.map(({ options }) => options?.type)).toEqual(typeOptions);
    });
});
describe('.batchSync', () => {
    it('returns an array of unique objects', () => {
        const factory = new TypeFactory<ComplexObject>(
            {
                ...defaults,
                options: {
                    type: TypeFactory.iterate(typeOptions),
                },
            },
            (defaults, iteration) => ({
                ...defaults,
                value: iteration,
            }),
        );
        const result = factory.batchSync(5);
        expect(result).toBeInstanceOf(Array);
        expect(result.map(({ value }) => value)).toEqual([0, 1, 2, 3, 4]);
        expect(result.map(({ options }) => options?.type)).toEqual(typeOptions);
    });
});
