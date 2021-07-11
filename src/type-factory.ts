import { ERROR_MESSAGES } from './constants';
import {
    FactoryBuildOptions,
    FactoryFunction,
    FactoryOptions,
    FactorySchema,
    OverridesAndFactory,
    UseOptions,
} from './types';
import {
    isOfType,
    isPromise,
    parseFactorySchemaAsync,
    parseFactorySchemaSync,
    validateFactorySchema,
} from './utils';
import { iterate, sample } from './helpers';

export class BuildArgProxy {}

export class Ref<T> {
    readonly value: ((iteration: number) => Promise<T> | T) | TypeFactory<T>;
    readonly options?: UseOptions<T>;

    constructor(
        value: ((iteration: number) => Promise<T> | T) | TypeFactory<T>,
        options?: Record<string, any>,
    ) {
        this.value = value;
        this.options = options;
    }
}

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
        return typeof this._defaults === 'function'
            ? this._defaults(this.counter)
            : this._defaults;
    }

    private parseOptions(
        options: FactoryBuildOptions<T> | undefined,
        iteration: number,
    ): [
        overrides?:
            | FactorySchema<Partial<T>>
            | Promise<FactorySchema<Partial<T>>>,
        factory?: FactoryFunction<T>,
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
            throw new Error(ERROR_MESSAGES.PROMISE_DEFAULTS);
        }
        if (isPromise(overrides)) {
            throw new Error(ERROR_MESSAGES.PROMISE_OVERRIDES);
        }
        const mergedSchema = validateFactorySchema(
            Object.assign({}, this.defaults, overrides),
        );
        const value = parseFactorySchemaSync<T>(mergedSchema, iteration);
        const result = factory ? factory(value, iteration) : value;
        if (isPromise(result)) {
            throw new Error(ERROR_MESSAGES.PROMISE_FACTORY);
        }
        return result;
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

    static use<P>(
        value: ((iteration: number) => Promise<P> | P) | TypeFactory<P>,
        options?: UseOptions<P>,
    ): Ref<P> {
        return new Ref<P>(value, options);
    }

    static iterate<P>(iterable: Iterable<P>): Generator<P, P, P> {
        return iterate<P>(iterable);
    }

    static sample<P>(iterable: Iterable<P>): Generator<P, P, P> {
        return sample<P>(iterable);
    }
}
