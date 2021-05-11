import { InterfaceForge } from './index';
import {BoundGenerator} from "./bound-generator";
export type FactoryFunction<T> = (
  values: T,
  iteration: number,
) => T | Promise<T>;
export type FactoryOptions<T> = {
  values?: FactorySchema<T>;
  factory?: FactoryFunction<T>;
};
export type FactoryDefaults<T> =
  | FactorySchema<T>
  | ((iteration: number) => FactorySchema<T> | Promise<FactorySchema<T>>);

export type FactorySchema<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? T[K] | InterfaceForge<T[K]> | (() => Promise<T[K]> | T[K])
    : T[K] | BoundGenerator<T[K]>;
};
