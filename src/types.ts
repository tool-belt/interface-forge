import { BuildArgProxy, TypeFactory } from './type-factory';
import { Ref } from './ref';

export type FactoryFunction<T> = (
    values: T,
    iteration: number,
) => T | Promise<T>;

export type FactoryOptions<T> =
    | FactorySchema<T>
    | ((iteration: number) => FactorySchema<T> | Promise<FactorySchema<T>>);

export type FactorySchema<T> = {
    [K in keyof T]: T[K] extends CallableFunction
        ? T[K]
        :
              | T[K]
              | Ref<T[K]>
              | TypeFactory<T[K]>
              | Generator<number, number, number>
              | BuildArgProxy;
};

export interface OverridesAndFactory<T> {
    overrides?: FactoryOptions<Partial<T>>;
    factory?: FactoryFunction<T>;
}

export type FactoryBuildOptions<T> =
    | OverridesAndFactory<T>
    | FactoryOptions<Partial<T>>;
