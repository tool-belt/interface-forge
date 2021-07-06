import { FactorySchema } from './types';
import { Ref } from './ref';
import { TypeFactory } from './type-factory';

export function isOfType<T>(
    variable: unknown,
    property: keyof T,
): variable is T {
    return typeof variable === "object" && variable !== null && Reflect.has(variable, property);
}

export function isPromise<T = any>(
    variable: unknown
): variable is Promise<T> {
    return isOfType<Promise<T>>(variable, "then")
}

export function parseFactorySchemaSync<T>(
    schema: FactorySchema<T>,
    iteration: number,
): T {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema)) {

        if (value instanceof TypeFactory) {
            output[key] = value.buildSync();
        } else if (value instanceof Ref) {
            output[key] = value.fn(iteration);
        } else if (isOfType<Generator<any, any, any>>(value, 'next')) {
            output[key] = value.next().value;
        } else if (
            typeof value === 'object' &&
            value !== null &&
            value.toString() === '[object Object]'
        ) {
            output[key] = parseFactorySchemaSync(value, iteration);
        } else {
            output[key] = value;
        }
    }

    return output as T;
}

export async function parseFactorySchemaAsync<T>(
    schema: FactorySchema<T>,
    iteration: number,
): Promise<T> {
    const output: Record<string, unknown> = {};
    for (const [key, rawValue] of Object.entries(schema)) {

        const value = await Promise.resolve(rawValue);
        if (value instanceof TypeFactory) {
            output[key] = await value.build();
        } else if (value instanceof Ref) {
            output[key] = await value.fn(iteration);
        } else if (isOfType<Generator<any, any, any>>(value, 'next')) {
            output[key] = await value.next().value;
        } else if (
            typeof value === 'object' &&
            value !== null &&
            value.toString() === '[object Object]'
        ) {
            output[key] = await parseFactorySchemaAsync(value, iteration);
        } else {
            output[key] = value;
        }
    }

    return output as T;
}
