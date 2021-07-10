import {
    FactoryBuildOptions,
    FactoryFunction,
    FactoryOptions,
    FactorySchema,
    OverridesAndFactory,
} from './types';
import { Ref } from './ref';
import {
    isOfType,
    isPromise,
    parseFactorySchemaAsync,
    parseFactorySchemaSync,
    validateFactorySchema,
} from './utils';

export class BuildArgProxy {}

export class TypeFactory<T> {
    private readonly _defaults: FactoryOptions<T>;
    public counter: number;
    public factory?: FactoryFunction<T>;

    constructor(defaults: FactoryOptions<T>, factory?: FactoryFunction<T>) {
        this._defaults = defaults;
        this.factory = factory;
        this.counter = 0;
    }

    get defaults(): Promise<FactorySchema<T>> | FactorySchema<T> {
        const value =
            typeof this._defaults === 'function'
                ? this._defaults(this.counter)
                : this._defaults;
        if (isPromise<FactorySchema<T>>(value)) {
            return Promise.resolve(value);
        }
        return value;
    }

    private parseOptions(
        options: FactoryBuildOptions<T> | undefined,
        iteration: number,
    ): [
        overrides:
            | FactorySchema<Partial<T>>
            | Promise<FactorySchema<Partial<T>>>
            | undefined,
        factory: FactoryFunction<T> | undefined,
    ] {
        if (!options) {
            return [undefined, this.factory];
        }
        if (
            isOfType<OverridesAndFactory<T>>(options, 'overrides') ||
            isOfType<OverridesAndFactory<T>>(options, 'factory')
        ) {
            const { overrides, factory } = options;
            return [
                typeof overrides === 'function'
                    ? overrides(iteration)
                    : overrides,
                factory ?? this.factory,
            ];
        }

        return [
            typeof options === 'function' ? options(iteration) : options,
            this.factory,
        ];
    }

    resetCounter(value = 0): void {
        this.counter = value;
    }

    async build(options?: FactoryBuildOptions<T>): Promise<T> {
        const iteration = this.counter;
        this.counter++;
        const [overrides, factory] = this.parseOptions(options, iteration);
        const defaults = await this.defaults;
        const mergedSchema = validateFactorySchema(
            Object.assign({}, defaults, await overrides),
        );
        const value = await parseFactorySchemaAsync<T>(mergedSchema, iteration);
        return factory ? factory(value, iteration) : value;
    }

    buildSync(options?: FactoryBuildOptions<T>): T {
        const iteration = this.counter;
        this.counter++;
        const [overrides, factory] = this.parseOptions(options, iteration);
        if (isPromise(this.defaults)) {
            throw new Error(
                '[interface-forge] buildSync does not support promise based defaults',
            );
        }
        if (isPromise(overrides)) {
            throw new Error(
                '[interface-forge] buildSync does not support promise based build overrides',
            );
        }
        const mergedSchema = validateFactorySchema(
            Object.assign({}, this.defaults, overrides),
        );
        const value = parseFactorySchemaSync<T>(mergedSchema, iteration);
        return (factory ? factory(value, iteration) : value) as T;
    }

    async batch(size: number, options?: FactoryBuildOptions<T>): Promise<T[]> {
        this.resetCounter();
        return Promise.all(
            new Array(size).fill(null).map(() => this.build(options)),
        );
    }

    batchSync(size: number, options?: FactoryBuildOptions<T>): T[] {
        this.resetCounter();
        return new Array(size).fill(null).map(() => this.buildSync(options));
    }

    static required(): BuildArgProxy {
        return new BuildArgProxy();
    }

    static bind<P>(fn: (iteration: number) => Promise<P> | P): Ref<P> {
        return new Ref<P>(fn);
    }

    static use<P>(
        forgeInstance: TypeFactory<P>,
        options?: FactoryBuildOptions<P>,
    ): Ref<P> {
        return new Ref<P>(async () => forgeInstance.build(options));
    }

    static useSync<P>(
        forgeInstance: TypeFactory<P>,
        options?: FactoryBuildOptions<P>,
    ): Ref<P> {
        return new Ref<P>(() => forgeInstance.buildSync(options));
    }

    static useBatch<P>(
        forgeInstance: TypeFactory<P>,
        size: number,
        options?: FactoryBuildOptions<P>,
    ): Ref<P[]> {
        return new Ref<P[]>(async () => forgeInstance.batch(size, options));
    }

    static useBatchSync<P>(
        forgeInstance: TypeFactory<P>,
        size: number,
        options?: FactoryBuildOptions<P>,
    ): Ref<P[]> {
        return new Ref<P[]>(() => forgeInstance.batchSync(size, options));
    }

    static iterate<E>(arr: E[]): Generator<E, E, E> {
        return (function* () {
            let counter = 0;
            while (true) {
                const value = arr[counter];
                if (counter === arr.length - 1) {
                    counter = 0;
                } else {
                    counter++;
                }
                yield value;
            }
        })();
    }

    static sample<E>(arr: E[]): E {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    static slice<E>(arr: E[], size: number): E[] {
        size = size > arr.length ? arr.length : size
        return [...arr].sort(() => 0.5 - Math.random()).slice(0, size)
    }
}
