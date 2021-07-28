import { ComplexObject, Options } from '../test-types';
import { TypeFactory } from '../../src';
import { parseFactorySchema } from '../../src/utils/schema';

const defaults: ComplexObject = {
    name: 'testObject',
    value: null,
};

describe('parseFactorySchema Async', () => {
    it('parses schema correctly for embedded instance', async () => {
        expect(
            await parseFactorySchema<ComplexObject>(
                {
                    ...defaults,
                    options: new TypeFactory<any>({
                        type: 'none',
                    }),
                },
                0,
                false,
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
            await parseFactorySchema<ComplexObject>(
                {
                    ...defaults,
                    value: TypeFactory.use(async () => Promise.resolve(99)),
                },
                0,
                false,
            ),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            value: 99,
        });
    });
    it('parses schema correctly using .use with TypeFactory + options', async () => {
        expect(
            await parseFactorySchema<ComplexObject>(
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
                false,
            ),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            options: {
                type: 'all',
            },
        });
    });
    it('parses schema correctly using .use with batch=5', async () => {
        const result = await parseFactorySchema<ComplexObject>(
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
            false,
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
        expect(result.options?.children?.length).toEqual(5);
    });
    it('parses schema correctly using generator fn', async () => {
        const generator = TypeFactory.iterate([
            new Promise((resolve) => resolve(1)),
            2,
            3,
        ]);
        expect(
            await parseFactorySchema<ComplexObject>(
                {
                    ...defaults,
                    value: generator,
                },
                0,
                false,
            ),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            value: 1,
        });
        expect(
            await parseFactorySchema<ComplexObject>(
                {
                    ...defaults,
                    value: generator,
                },
                1,
                false,
            ),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            value: 2,
        });
        expect(
            await parseFactorySchema<ComplexObject>(
                {
                    ...defaults,
                    value: generator,
                },
                2,
                false,
            ),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            value: 3,
        });
        expect(
            await parseFactorySchema<ComplexObject>(
                {
                    ...defaults,
                    value: generator,
                },
                4,
                false,
            ),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            value: 1,
        });
    });
});

describe('parseFactorySchema Sync', () => {
    it('parses schema correctly for embedded instance', () => {
        expect(
            parseFactorySchema<ComplexObject>(
                {
                    ...defaults,
                    options: new TypeFactory<any>({
                        type: 'none',
                    }),
                },
                0,
                true,
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
            parseFactorySchema<ComplexObject>(
                {
                    ...defaults,
                    value: TypeFactory.use(() => 99),
                },
                0,
                true,
            ),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            value: 99,
        });
    });
    it('parses schema correctly using .use with factory', () => {
        expect(
            parseFactorySchema<ComplexObject>(
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
                true,
            ),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            options: {
                type: 'all',
            },
        });
    });
    it('parses schema correctly using .use with batch=5', () => {
        const result = parseFactorySchema<ComplexObject>(
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
            true,
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
        // @ts-ignore
        expect(result.options?.children?.length).toEqual(5);
    });
    it('parses schema correctly using generator fn', () => {
        const generator = TypeFactory.iterate([1, 2, 3]);
        expect(
            parseFactorySchema<ComplexObject>(
                {
                    ...defaults,
                    value: generator,
                },
                0,
                true,
            ),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            value: 1,
        });
        expect(
            parseFactorySchema<ComplexObject>(
                {
                    ...defaults,
                    value: generator,
                },
                1,
                true,
            ),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            value: 2,
        });
        expect(
            parseFactorySchema<ComplexObject>(
                {
                    ...defaults,
                    value: generator,
                },
                2,
                true,
            ),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            value: 3,
        });
        expect(
            parseFactorySchema<ComplexObject>(
                {
                    ...defaults,
                    value: generator,
                },
                4,
                true,
            ),
        ).toStrictEqual<ComplexObject>({
            ...defaults,
            value: 1,
        });
    });
});
