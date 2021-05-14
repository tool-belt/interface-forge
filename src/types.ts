import { Ref } from './ref';
import { InterfaceForge } from './interface-forge';

export type FactoryFunction<T> = (
    values: T,
    iteration: number,
) => T | Promise<T>;

export type FactoryOptions<T> =
    | FactorySchema<T>
    | (() => FactorySchema<T> | Promise<FactorySchema<T>>);

export type FactorySchema<T> = {
    [K in keyof T]: T[K] extends CallableFunction
        ? T[K]
        : T[K] | Ref<T[K]> | InterfaceForge<T[K]> | Generator<number, number, number>;
};
