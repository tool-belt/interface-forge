import { ComplexObject, Options } from '../test-types';
import { TypeFactory } from '../../src';
import {
    parseFactorySchemaAsync,
    parseFactorySchemaSync,
} from '../../src/utils/schema';

const defaults: ComplexObject = {
    name: 'testObject',
    value: null,
};

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
        expect(result.options?.children?.length).toEqual(5);
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
        expect(result.options?.children?.length).toEqual(5);
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
