import { ComplexObject, Options } from './test-types';
import { TypeFactory } from '../src';

const typeOptions = ['1', '2', '3', 'all', 'none'];

const defaults: ComplexObject = {
    name: 'testObject',
    value: null,
};

describe('InterfaceFactory', () => {
    describe('.build', () => {
        it('builds correctly with defaults object literal', async () => {
            const factory = new TypeFactory<ComplexObject>(defaults);
            expect(await factory.build()).toStrictEqual<ComplexObject>(
                defaults,
            );
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
                    overrides: async () =>
                        Promise.resolve({ name: 'newObject' }),
                }),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                name: 'newObject',
            });
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
            expect(result.map(({ options }) => options?.type)).toEqual(
                typeOptions,
            );
        });
    });
    describe('parse schema', () => {
        it('parses schema correctly for embedded instance', async () => {
            const factory = new TypeFactory<ComplexObject>({
                ...defaults,
                options: new TypeFactory<any>({
                    type: 'none',
                }),
            });
            expect(await factory.build()).toStrictEqual<ComplexObject>({
                ...defaults,
                options: {
                    type: 'none',
                },
            });
        });
        it('parses schema correctly using .bind', async () => {
            const factory = new TypeFactory<ComplexObject>({
                ...defaults,
                value: TypeFactory.bind(async () => Promise.resolve(99)),
            });
            expect(await factory.build()).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 99,
            });
        });
        it('parses schema correctly using .use', async () => {
            const factory = new TypeFactory<ComplexObject>({
                ...defaults,
                options: TypeFactory.use<Options>(
                    new TypeFactory<Options>({
                        type: 'none',
                    }),
                    { overrides: { type: 'all' } },
                ),
            });
            expect(await factory.build()).toStrictEqual<ComplexObject>({
                ...defaults,
                options: {
                    type: 'all',
                },
            });
        });
        it('parses schema correctly using .useBatch', async () => {
            const factory = new TypeFactory<ComplexObject>({
                ...defaults,
                options: TypeFactory.use<Options>(
                    new TypeFactory<Options>({
                        type: 'none',
                        children: TypeFactory.useBatch(
                            new TypeFactory<ComplexObject>(defaults),
                            5,
                            {
                                factory: (values, iteration) => ({
                                    ...values,
                                    value: iteration,
                                }),
                            },
                        ),
                    }),
                ),
            });
            const result = await factory.build();
            expect(result).toStrictEqual<ComplexObject>({
                ...defaults,
                options: {
                    type: 'none',
                    children: expect.arrayContaining([
                        {
                            ...defaults,
                            value: expect.any(Number),
                        },
                    ]),
                },
            });
            expect(result?.options?.children?.length).toEqual(5);
        });
        it('parses schema correctly using .iterate', async () => {
            const factory = new TypeFactory<ComplexObject>({
                ...defaults,
                value: TypeFactory.iterate([1, 2, 3]),
            });
            expect(await factory.build()).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 1,
            });
            expect(await factory.build()).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 2,
            });
            expect(await factory.build()).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 3,
            });
            expect(await factory.build()).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 1,
            });
        });
        it('parses schema correctly using .required', async () => {
            const factory = new TypeFactory<ComplexObject>({
                ...defaults,
                options: TypeFactory.required(),
            });
            try {
                await factory.build();
            } catch (e) {
                expect((e as Error).message).toEqual(
                    `[interface-forge] missing required build arguments: options`,
                );
            }
            expect(
                async () => await factory.build({ overrides: { options: {} } }),
            ).not.toThrow();
        });
    });
    describe('.iterate', () => {
        it('cycles through values correctly', () => {
            const list = [1, 2, 3];
            const generator = TypeFactory.iterate(list);
            expect(generator.next().value).toEqual(1);
            expect(generator.next().value).toEqual(2);
            expect(generator.next().value).toEqual(3);
            expect(generator.next().value).toEqual(1);
            expect(generator.next().value).toEqual(2);
            expect(generator.next().value).toEqual(3);
        });
    });
});
