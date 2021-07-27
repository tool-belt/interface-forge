import { ERROR_MESSAGES } from './constants';
import {
    FactoryBuildOptions,
    FactoryDefaults,
    FactoryFunction,
    FactorySchema,
    UseOptions,
} from './types';
import { isPromise } from './utils/guards';
import { iterate, sample } from './helpers';
import { merge } from './utils/general';
import {
    parseFactorySchemaAsync,
    parseFactorySchemaSync,
} from './utils/schema';
import { parseOptions } from './utils/options';
import {
    validateFactoryResult,
    validateFactorySchema,
} from './utils/validators';

type SyncBuildArgs<T> = {
    defaults: FactorySchema<T>;
    overrides?: FactoryDefaults<Partial<T>>;
    factory?: FactoryFunction<T>;
    iteration: number;
};

type AsyncBuildArgs<T> = {
    defaults: Promise<FactorySchema<T>> | FactorySchema<T>;
    overrides?:
        | Promise<FactoryDefaults<Partial<T>>>
        | FactoryDefaults<Partial<T>>;
    factory?: FactoryFunction<T>;
    iteration: number;
};

export class BuildArgProxy {}

export class DerivedValueProxy {}

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
    private readonly defaults: FactoryDefaults<T>;
    public counter: number;
    public factory?: FactoryFunction<T>;

    constructor(defaults: FactoryDefaults<T>, factory?: FactoryFunction<T>) {
        this.defaults = defaults;
        this.factory = factory;
        this.counter = 0;
    }

    resetCounter(value = 0): void {
        this.counter = value;
    }

    private preBuild = (
        isSync: boolean,
        options?: FactoryBuildOptions<T>,
    ): SyncBuildArgs<T> | AsyncBuildArgs<T> => {
        const iteration = this.counter;
        this.counter++;
        const defaults =
            typeof this.defaults === 'function'
                ? this.defaults(iteration)
                : this.defaults;
        const [overrides, factory = this.factory] = parseOptions<T>(
            options,
            iteration,
        );
        if (isSync) {
            if (isPromise(defaults)) {
                throw new Error(ERROR_MESSAGES.PROMISE_DEFAULTS);
            }
            if (isPromise(overrides)) {
                throw new Error(ERROR_MESSAGES.PROMISE_OVERRIDES);
            }
        }
        return { defaults, overrides, factory, iteration };
    };

    private postBuild(isSync: boolean, result: T | Promise<T>): T | Promise<T> {
        if (isPromise(result)) {
            if (isSync) {
                throw new Error(ERROR_MESSAGES.PROMISE_FACTORY);
            }
            return result.then(validateFactoryResult);
        }
        return validateFactoryResult(result);
    }

    build = async (options?: FactoryBuildOptions<T>): Promise<T> => {
        const { defaults, overrides, factory, iteration } = this.preBuild(
            false,
            options,
        );
        const mergedSchema = validateFactorySchema(
            merge(
                ...(await Promise.all([
                    Promise.resolve(defaults),
                    Promise.resolve(overrides),
                ])),
            ),
        );
        const value = await parseFactorySchemaAsync<T>(mergedSchema, iteration);
        return this.postBuild(
            false,
            factory ? factory(value, iteration) : value,
        );
    };

    buildSync = (options?: FactoryBuildOptions<T>): T => {
        const { defaults, overrides, factory, iteration } = this.preBuild(
            true,
            options,
        ) as SyncBuildArgs<T>;
        const mergedSchema = validateFactorySchema(merge(defaults, overrides));
        const value = parseFactorySchemaSync<T>(mergedSchema, iteration);
        return this.postBuild(
            true,
            factory ? factory(value, iteration) : value,
        ) as T;
    };

    async batch(size: number, options?: FactoryBuildOptions<T>): Promise<T[]> {
        return Promise.all(new Array(size).fill(options).map(this.build));
    }

    batchSync(size: number, options?: FactoryBuildOptions<T>): T[] {
        return new Array(size).fill(options).map(this.buildSync);
    }

    static required(): BuildArgProxy {
        return new BuildArgProxy();
    }

    static derived(): DerivedValueProxy {
        return new DerivedValueProxy();
    }

    static use<P>(
        value: ((iteration: number) => Promise<P> | P) | TypeFactory<P>,
        options?: UseOptions<P>,
    ): Ref<P> {
        return new Ref<P>(value, options);
    }

    static iterate = iterate;
    static sample = sample;
}
