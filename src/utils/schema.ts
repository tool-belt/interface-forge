import { BuildArgProxy, Ref, TypeFactory } from '../type-factory';
import { ERROR_MESSAGES } from '../constants';
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
        } else if (isRecord(value)) {
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
        } else if (typeof value === 'object' && value !== null) {
            output[key] = await parseFactorySchemaAsync(value, iteration);
        } else {
            output[key] = value;
        }
    }

    return output as T;
}

export function validateFactorySchema<T extends FactorySchema<any>>(
    schema: T,
): T {
    const missingValues: string[] = [];
    Object.entries(schema).forEach(([key, value]) => {
        if (value instanceof BuildArgProxy) {
            missingValues.push(key);
        }
    });
    if (missingValues.length) {
        throw new Error(
            ERROR_MESSAGES.MISSING_BUILD_ARGS.replace(
                ':missingArgs',
                missingValues.join(', '),
            ),
        );
    }
    return schema;
}
