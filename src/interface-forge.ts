import { FactoryFunction, FactoryOptions, FactorySchema } from './types';
import { BoundGenerator } from './bound-generator';
import { isOfType } from './utils';

export class InterfaceForge<T> {
    defaults: FactoryOptions<T>;
    factory?: FactoryFunction<T>;

    constructor(defaults: FactoryOptions<T>, factory?: FactoryFunction<T>) {
        this.defaults = defaults;
        this.factory = factory;
    }

    private async _parse_schema(schema: FactorySchema<T>): Promise<T> {
        const output: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(schema)) {
            if (value instanceof InterfaceForge) {
                output[key] = await value.build();
            } else if (value instanceof BoundGenerator) {
                output[key] = await value.call({ ...schema });
            } else if (isOfType<Generator<any, any, any>>(value, 'next')) {
                output[key] = value.next().value;
            } else {
                output[key] = value;
            }
        }
        return output as T;
    }

    async build(
        options?: FactoryOptions<Partial<T>>,
        factory?: FactoryFunction<T>,
        iteration = 1,
    ): Promise<T> {
        const defaults =
            typeof this.defaults === 'function'
                ? await this.defaults(iteration)
                : this.defaults;
        const value = await this._parse_schema(
            Object.assign(
                {},
                defaults,
                typeof options === 'function'
                    ? await options(iteration)
                    : options ?? {} as FactorySchema<any>,
            ),
        );
        const fn = factory ?? this.factory;
        return fn ? fn(value, iteration) : value;
    }

    batch(size: number) {
        return async (
            options?: FactoryOptions<Partial<T>>,
            factory?: FactoryFunction<T>,
        ): Promise<T[]> => {
            return Promise.all(
                new Array(size)
                    .fill(null)
                    .map((_, i) => this.build(options, factory, i + 1)),
            );
        };
    }

    static use<P>(fn: (values: any) => Promise<P> | P): BoundGenerator<P> {
        return new BoundGenerator<P>(fn);
    }

    static bind<P>(
        forgeInstance: InterfaceForge<P>,
        options?: FactoryOptions<Partial<P>>,
        factory?: FactoryFunction<P>,
    ): BoundGenerator<P> {
        return new BoundGenerator<P>((iteration: number) =>
            forgeInstance.build(options, factory, iteration),
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
