import { InterfaceForge } from '../src';

interface Options {
    type: '1' | '2' | '3' | 'all' | 'none';
    children?: ComplexObject[];
}

interface ComplexObject {
    name: string;
    value: number | null;
    options?: Options;
}

describe('InterfaceFactory', () => {
    const defaults: ComplexObject = {
        name: 'testObject',
        value: 0,
    };
    describe('.build', () => {
        it('builds correctly with defaults object literal', async () => {
            const factory = new InterfaceForge<ComplexObject>(defaults);
            expect(await factory.build()).toStrictEqual<ComplexObject>(
                defaults,
            );
        });
        it('builds correctly with defaults function', async () => {
            const factory = new InterfaceForge<ComplexObject>((i) => ({
                ...defaults,
                value: i,
            }));
            expect(await factory.build()).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 1,
            });
        });
        it('builds correctly with builder function', async () => {
            const factory = new InterfaceForge<ComplexObject>(
                defaults,
                (defaults, iteration) => ({
                    ...defaults,
                    name: 'newObject',
                    value: iteration,
                }),
            );
            expect(await factory.build()).toStrictEqual<ComplexObject>({
                ...defaults,
                name: 'newObject',
                value: 1,
            });
        });
        it('merges options correctly when passed object literal', async () => {
            const factory = new InterfaceForge<ComplexObject>(defaults);
            expect(
                await factory.build({ name: 'newObject' }),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                name: 'newObject',
            });
        });
        it('merges options correctly when passed options function', async () => {
            const factory = new InterfaceForge<ComplexObject>(defaults);
            expect(
                await factory.build(() => ({ name: 'newObject' })),
            ).toStrictEqual<ComplexObject>({
                ...defaults,
                name: 'newObject',
            });
        });
    });
    describe('parse schema', () => {
        it('parses schema correctly for embedded instance', async () => {
            const factory = new InterfaceForge<ComplexObject>({
                ...defaults,
                options: new InterfaceForge<any>({
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
        it('parses schema correctly using .use', async () => {
            const factory = new InterfaceForge<ComplexObject>({
                ...defaults,
                value: InterfaceForge.use(
                    async () =>
                        await new Promise<number>((resolve) => resolve(99)),
                ),
            });
            expect(await factory.build()).toStrictEqual<ComplexObject>({
                ...defaults,
                value: 99,
            });
        });
        it('parses schema correctly using .bind', async () => {
            const factory = new InterfaceForge<ComplexObject>({
                ...defaults,
                options: InterfaceForge.bind<Options>(
                    new InterfaceForge<Options>({
                        type: 'none',
                    }),
                    { type: 'all' },
                ),
            });
            expect(await factory.build()).toStrictEqual<ComplexObject>({
                ...defaults,
                options: {
                    type: 'all',
                },
            });
        });
        it('parses schema correctly using .iterate', async () => {
            const factory = new InterfaceForge<ComplexObject>({
                ...defaults,
                value: InterfaceForge.iterate([1, 2, 3]),
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
    });
    describe('.batch', () => {
        it('returns an array of unique objects', async () => {
            const factory = new InterfaceForge<ComplexObject>(
                defaults,
                (defaults, iteration) => ({
                    ...defaults,
                    value: iteration,
                }),
            );
            const result = await factory.batch(5)();
            expect(result).toBeInstanceOf(Array);
            expect(result.map(({ value }) => value)).toEqual([1, 2, 3, 4, 5]);
        });
    });
    describe('.iterate', () => {
        it('cycles through values correctly', () => {
            const list = [1, 2, 3];
            const generator = InterfaceForge.iterate(list);
            expect(generator.next().value).toEqual(1);
            expect(generator.next().value).toEqual(2);
            expect(generator.next().value).toEqual(3);
            expect(generator.next().value).toEqual(1);
            expect(generator.next().value).toEqual(2);
            expect(generator.next().value).toEqual(3);
        });
    });
});
