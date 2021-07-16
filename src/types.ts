import { BuildArgProxy, Ref, TypeFactory } from './type-factory';

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
              | Promise<T[K]>
              | Ref<T[K]>
              | TypeFactory<T[K]>
              | Generator<T[K], T[K], T[K]>
              | BuildArgProxy;
};

export interface OverridesAndFactory<T> {
    overrides?: FactoryOptions<Partial<T>>;
    factory?: FactoryFunction<T>;
}

export type FactoryBuildOptions<T> =
    | OverridesAndFactory<T>
    | FactoryOptions<Partial<T>>;

export type UseOptions<T> = { batch?: number } & FactoryBuildOptions<T>;

export interface FixtureStatic<T> {
    created: string;
    data: T;
    structure: string[];
}
