import { ComplexObject, Options } from './test-types';
import { ERROR_MESSAGES, TypeFactory } from '../src';
import {
    isPromise,
    isRecord,
    parseFactorySchemaAsync,
    parseFactorySchemaSync,
    parseOptions,
    throwIfPromise,
    validateFactorySchema,
} from '../src/utils';

const defaults: ComplexObject = {
    name: 'testObject',
    value: null,
};

describe('isRecord', () => {
    it('returns true for records and false for non-records', () => {
        expect(isRecord({})).toBeTruthy();
        expect(isRecord(new Map())).toBeTruthy();
        expect(isRecord(new WeakMap())).toBeTruthy();
        expect(isRecord(new Map())).toBeTruthy();
        expect(isRecord([])).toBeFalsy();
        expect(isRecord(new Set())).toBeFalsy();
        expect(isRecord(() => null)).toBeFalsy();
        expect(isRecord('')).toBeFalsy();
        expect(isRecord(1)).toBeFalsy();
    });
});

describe('isPromise', () => {
    it('returns true for promises and false for non promises', () => {
        expect(isPromise(new Promise((resolve) => resolve(null)))).toBeTruthy();
        expect(isPromise({})).toBeFalsy();
        expect(isPromise(null)).toBeFalsy();
        expect(isPromise(1)).toBeFalsy();
    });
});

describe('throwIfPromise', () => {
    it('throws when promise and passes value otherwise', () => {
        expect(() =>
            throwIfPromise(new Promise((resolve) => resolve(null)), 'test'),
        ).toThrow(ERROR_MESSAGES.PROMISE_VALUE.replace(':key', 'test'));
        expect(throwIfPromise({}, 'test')).toEqual({});
    });
});

describe('parse schema', () => {
    describe('parseFactorySchemaAsync', () => {
        it('parses schema correctly for embedded instance', async () => {
            expect(
                await parseFactorySchemaAsync<ComplexObject>(
                    {
                        ...defaults,
                        options: new TypeFactory<any>({
                            type: 'none',
                        }),
                    },
                    0,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                options: {
                    type: 'none',
                },
            });
        });
        it('parses schema correctly using .use with function', async () => {
            expect(
                await parseFactorySchemaAsync<ComplexObject>(
                    {
                        ...defaults,
                        value: TypeFactory.use(async () => Promise.resolve(99)),
                    },
                    0,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 99,
            });
        });
        it('parses schema correctly using .use with TypeFactory + options', async () => {
            expect(
                await parseFactorySchemaAsync<ComplexObject>(
                    {
                        ...defaults,
                        options: TypeFactory.use<Options>(
                            new TypeFactory<Options>({
                                type: 'none',
                            }),
                            { overrides: { type: 'all' } },
                        ),
                    },
                    0,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                options: {
                    type: 'all',
                },
            });
        });
        it('parses schema correctly using .use with batch=5', async () => {
            const result = await parseFactorySchemaAsync<ComplexObject>(
                {
                    ...defaults,
                    options: TypeFactory.use<Options>(
                        new TypeFactory<Options>({
                            type: 'none',
                            children: TypeFactory.use(
                                new TypeFactory<ComplexObject>(defaults),

                                {
                                    batch: 5,
                                    factory: (values, iteration) => ({
                                        ...values,
                                        value: iteration,
                                    }),
                                },
                            ),
                        }),
                    ),
                },
                0,
            );
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
        it('parses schema correctly using generator fn', async () => {
            const generator = TypeFactory.iterate([
                new Promise((resolve) => resolve(1)),
                2,
                3,
            ]);
            expect(
                await parseFactorySchemaAsync<ComplexObject>(
                    {
                        ...defaults,
                        value: generator,
                    },
                    0,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 1,
            });
            expect(
                await parseFactorySchemaAsync<ComplexObject>(
                    {
                        ...defaults,
                        value: generator,
                    },
                    1,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 2,
            });
            expect(
                await parseFactorySchemaAsync<ComplexObject>(
                    {
                        ...defaults,
                        value: generator,
                    },
                    2,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 3,
            });
            expect(
                await parseFactorySchemaAsync<ComplexObject>(
                    {
                        ...defaults,
                        value: generator,
                    },
                    4,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 1,
            });
        });
    });
    describe('parseFactorySchemaSync', () => {
        it('parses schema correctly for embedded instance', () => {
            expect(
                parseFactorySchemaSync<ComplexObject>(
                    {
                        ...defaults,
                        options: new TypeFactory<any>({
                            type: 'none',
                        }),
                    },
                    0,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                options: {
                    type: 'none',
                },
            });
        });
        it('parses schema correctly using .use with function', () => {
            expect(
                parseFactorySchemaSync<ComplexObject>(
                    {
                        ...defaults,
                        value: TypeFactory.use(() => 99),
                    },
                    0,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 99,
            });
        });
        it('parses schema correctly using .use with factory', () => {
            expect(
                parseFactorySchemaSync<ComplexObject>(
                    {
                        ...defaults,
                        options: TypeFactory.use<Options>(
                            new TypeFactory<Options>({
                                type: 'none',
                            }),
                            { overrides: { type: 'all' } },
                        ),
                    },
                    0,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                options: {
                    type: 'all',
                },
            });
        });
        it('parses schema correctly using .use with batch=5', () => {
            const result = parseFactorySchemaSync<ComplexObject>(
                {
                    ...defaults,
                    options: TypeFactory.use<Options>(
                        new TypeFactory<Options>({
                            type: 'none',
                            children: TypeFactory.use(
                                new TypeFactory<ComplexObject>(defaults),

                                {
                                    batch: 5,
                                    factory: (values, iteration) => ({
                                        ...values,
                                        value: iteration,
                                    }),
                                },
                            ),
                        }),
                    ),
                },
                0,
            );
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
        it('parses schema correctly using generator fn', () => {
            const generator = TypeFactory.iterate([1, 2, 3]);
            expect(
                parseFactorySchemaSync<ComplexObject>(
                    {
                        ...defaults,
                        value: generator,
                    },
                    0,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 1,
            });
            expect(
                parseFactorySchemaSync<ComplexObject>(
                    {
                        ...defaults,
                        value: generator,
                    },
                    1,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 2,
            });
            expect(
                parseFactorySchemaSync<ComplexObject>(
                    {
                        ...defaults,
                        value: generator,
                    },
                    2,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 3,
            });
            expect(
                parseFactorySchemaSync<ComplexObject>(
                    {
                        ...defaults,
                        value: generator,
                    },
                    4,
                ),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 1,
            });
        });
    });
});

describe('validateFactorySchema', () => {
    it('throws when encountering a build proxy instance', () => {
        expect(() =>
            validateFactorySchema<ComplexObject>({
                ...defaults,
                options: TypeFactory.required() as any,
            }),
        ).toThrow(
            ERROR_MESSAGES.MISSING_BUILD_ARGS.replace(
                ':missingArgs',
                'options',
            ),
        );
    });
    it('doesnt throw for normal values', () => {
        expect(validateFactorySchema<ComplexObject>(defaults)).toEqual(
            defaults,
        );
    });
});

describe('parseOptions', () => {
    it('returns [undefined, undefined] when passed undefined', () => {
        expect(parseOptions(undefined, 1)).toEqual([undefined, undefined]);
    });
    it('returns [options, undefined] when passed options object', () => {
        const options = { key: 'value' };
        expect(parseOptions(options, 1)).toEqual([options, undefined]);
    });
    it('calls options function with iteration', () => {
        const options = jest.fn((iteration: number) => ({ key: iteration }));
        const result = parseOptions(options, 1);
        expect(options).toHaveBeenCalledWith(1);
        expect(result).toEqual([{ key: 1 }, undefined]);
    });
    describe('handles OverridesAndFactory object correctly', () => {
        it('returns both overrides and factory when passed both', () => {
            const overrides = { key: 'value' };
            const factory = jest.fn();
            expect(parseOptions({ overrides, factory }, 1)).toEqual([
                overrides,
                factory,
            ]);
        });
        it('returns [undefined, factory] when only factory is passed', () => {
            const factory = jest.fn();
            expect(parseOptions({ factory }, 1)).toEqual([undefined, factory]);
        });
        it('returns [overrides, undefined] when only overrides are passed', () => {
            const overrides = { key: 'value' };
            expect(parseOptions({ overrides }, 1)).toEqual([
                overrides,
                undefined,
            ]);
        });
        it('calls function overrides with iteration', () => {
            const overrides = jest.fn((iteration: number) => ({
                key: iteration,
            }));
            const factory = jest.fn();
            const result = parseOptions({ overrides, factory }, 1);
            expect(overrides).toHaveBeenCalledWith(1);
            expect(result).toEqual([{ key: 1 }, factory]);
        });
    });
});
