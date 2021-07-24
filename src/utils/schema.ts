import { DerivedValueProxy, Ref, TypeFactory } from '../type-factory';
import { FactorySchema } from '../types';
import { isOfType, isRecord } from './guards';
import { throwIfPromise } from './general';

export function parseFactorySchemaSync<T>(
    schema: FactorySchema<T>,
    iteration: number,
): T {
    const output: Record<string, unknown> = {};
    for (const [key, rawValue] of Object.entries(schema)) {
        const value = throwIfPromise(rawValue, key);
        if (value instanceof TypeFactory) {
            output[key] = value.buildSync();
        } else if (value instanceof Ref) {
            if (value.value instanceof TypeFactory) {
                const { value: factory } = value;
                const { batch, ...options } = value.options ?? {};
                output[key] = batch
                    ? factory.batchSync(batch, options)
                    : factory.buildSync(options);
            } else {
                output[key] = value.value(iteration);
            }
        } else if (isOfType<Generator<any, any, any>>(value, 'next')) {
            output[key] = throwIfPromise(value.next().value, key);
        } else if (!(value instanceof DerivedValueProxy) && isRecord(value)) {
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
            if (value.value instanceof TypeFactory) {
                const { value: factory } = value;
                const { batch, ...options } = value.options ?? {};
                output[key] = batch
                    ? await factory.batch(batch, options)
                    : await factory.build(options);
            } else {
                output[key] = await value.value(iteration);
            }
        } else if (isOfType<Generator<any, any, any>>(value, 'next')) {
            output[key] = await value.next().value;
        } else if (!(value instanceof DerivedValueProxy) && isRecord(value)) {
            output[key] = await parseFactorySchemaAsync(value, iteration);
        } else {
            output[key] = value;
        }
    }

    return output as T;
}
