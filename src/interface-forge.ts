import { FactoryFunction, FactoryOptions, FactorySchema } from './types';
import { Ref } from './ref';
import { isOfType } from './utils';


export class InterfaceForge<T> {
    private readonly _defaults: FactoryOptions<T>;
    public factory?: FactoryFunction<T>;

    constructor(defaults: FactoryOptions<T>, factory?: FactoryFunction<T>) {
        this._defaults = defaults;
        this.factory = factory;
    }

    get defaults(): Promise<FactorySchema<T>> {
        return typeof this._defaults === 'function'
            ? Promise.resolve(this._defaults())
            : Promise.resolve(this._defaults);
    }

    private async _parse_schema(
        schema: FactorySchema<T>,
    ): Promise<T> {
        const output: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(schema)) {
            if (value instanceof InterfaceForge) {
                output[key] = await value.build();
            } else if (value instanceof Ref) {
                output[key] = await value.fn({ ...schema });
            } else if (isOfType<Generator<any, any, any>>(value, 'next')) {
                output[key] = await value.next().value;
            } else {
                output[key] = await Promise.resolve(value);
            }
        }
        return output as T;
    }

    async build(
        options?: FactoryOptions<Partial<T>>,
        factory?: FactoryFunction<T>,
        iteration = 0,
    ): Promise<T> {
        const value = await this._parse_schema(
            Object.assign(
                {},
                await this.defaults,
                await Promise.resolve(
                    typeof options === 'function' ? options() : options,
                ),
            )
        );
        const fn = factory ?? this.factory;
        return Promise.resolve(fn ? fn(value, iteration) : value);
    }

    async batch(
        size: number,
        options?: FactoryOptions<Partial<T>>,
        factory?: FactoryFunction<T>,
    ): Promise<T[]> {
        return Promise.all(
            new Array(size)
                .fill(null)
                .map((_, i) => this.build(options, factory, i + 1)),
        );
    }

    static bind<P>(fn: (values: any) => Promise<P> | P): Ref<P> {
        return new Ref<P>(fn);
    }

    static use<P>(
        forgeInstance: InterfaceForge<P>,
        options?: FactoryOptions<Partial<P>>,
        factory?: FactoryFunction<P>,
    ): Ref<P> {
        return new Ref<P>(() =>
            forgeInstance.build(options, factory),
        );
    }

    static useBatch<P>(
        forgeInstance: InterfaceForge<P>,
        size: number,
        options?: FactoryOptions<Partial<P>>,
        factory?: FactoryFunction<P>,
    ): Ref<P[]> {
        return new Ref<P[]>(() =>
            forgeInstance.batch(size, options, factory),
        );
    }

    static iterate<P>(list: P[]): Generator<P, P, P> {
        return (function* () {
            let counter = 0;
            while (true) {
                const value = list[counter];
                if (counter === list.length - 1) {
                    counter = 0;
                } else {
                    counter++;
                }
                yield value;
            }
        })();
    }
}
