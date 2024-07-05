import { BuildArgProxy, Factory, Ref } from './factory';

export type FactoryFunction<T> = (
    values: T,
    iteration: number,
) => T | Promise<T>;

export type FactoryDefaults<T> =
    | FactorySchema<T>
    | ((iteration: number) => FactorySchema<T> | Promise<FactorySchema<T>>);

export type FactorySchema<T> = {
    [K in keyof T]: T[K] extends CallableFunction
        ? T[K]
        :
              | T[K]
              | Promise<T[K]>
              | Ref<T[K]>
              | Factory<T[K]>
              | Generator<T[K], T[K], T[K]>
              | BuildArgProxy;
};

export interface OverridesAndFactory<T> {
    factory?: FactoryFunction<T>;
    overrides?: FactoryDefaults<Partial<T>>;
}

export type FactoryBuildOptions<T> =
    | OverridesAndFactory<T>
    | FactoryDefaults<Partial<T>>;

export type UseOptions<T> = { batch?: number } & FactoryBuildOptions<T>;
