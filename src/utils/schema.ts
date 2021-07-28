import { DerivedValueProxy, Ref, TypeFactory } from '../type-factory';
import { ERROR_MESSAGES } from '../constants';
import { FactorySchema } from '../types';
import { isOfType, isPromise, isRecord } from './guards';

function parseRef(
    { value, options: { batch, ...options } = {} }: Ref<any>,
    isSync: boolean,
    iteration: number,
): unknown {
    if (value instanceof TypeFactory) {
        if (batch) {
            if (isSync) {
                return value.batchSync(batch, options) as unknown;
            }
            return value.batch(batch, options);
        }
        if (isSync) {
            return value.buildSync(options);
        }
        return value.build(options);
    } else {
        return value(iteration);
    }
}

async function recursiveResolve<T>(
    parsedSchema: Record<string, any>,
): Promise<T> {
    const output = {};
    for (const [key, value] of Object.entries(parsedSchema)) {
        if (isRecord(value)) {
            Reflect.set(output, key, recursiveResolve(value));
        } else {
            Reflect.set(
                output,
                key,
                isPromise(value) ? await Promise.resolve(value) : value,
            );
        }
    }
    return output as T;
}

export function parseFactorySchema<T>(
    schema: FactorySchema<T>,
    iteration: number,
    isSync: boolean,
): T | Promise<T> {
    const output: Record<string, unknown> = {};
    for (let [key, value] of Object.entries(schema)) {
        if (value instanceof TypeFactory) {
            value = isSync ? value.buildSync() : value.build();
        } else if (value instanceof Ref) {
            value = parseRef(value, isSync, iteration);
        } else if (isOfType<Generator<any, any, any>>(value, 'next')) {
            value = value.next().value;
        } else if (!(value instanceof DerivedValueProxy) && isRecord(value)) {
            value = parseFactorySchema(value, iteration, isSync);
        }
        if (isPromise(value) && isSync) {
            throw new Error(ERROR_MESSAGES.PROMISE_VALUE.replace(':key', key));
        }
        output[key] = value;
    }

    return (isSync ? output : recursiveResolve(output)) as T;
}
