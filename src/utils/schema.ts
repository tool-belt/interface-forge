import { DerivedValueProxy, Ref, TypeFactory } from '../type-factory';
import { ERROR_MESSAGES } from '../constants';
import { FactorySchema } from '../types';
import { isIterator, isPromise, isRecord } from '@tool-belt/type-predicates';

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
        const resolved: unknown = isPromise(value) ? await value : value;
        if (isRecord(resolved)) {
            Reflect.set(output, key, await recursiveResolve(resolved));
        } else {
            Reflect.set(output, key, resolved);
        }
    }
    return output as T;
}

export function parseFactorySchema<T>(
    schema: FactorySchema<T>,
    iteration: number,
    isSync: boolean,
    parent = '',
): T | Promise<T> {
    const output: Record<string, unknown> = {};
    for (let [key, value] of Object.entries(schema)) {
        if (value instanceof TypeFactory) {
            value = isSync ? value.buildSync() : value.build();
        } else if (value instanceof Ref) {
            value = parseRef(value, isSync, iteration);
        } else if (isIterator(value)) {
            value = value.next().value;
        } else if (!(value instanceof DerivedValueProxy) && isRecord(value)) {
            value = parseFactorySchema(value, iteration, isSync, key);
        }
        if (isPromise(value) && isSync) {
            throw new Error(
                ERROR_MESSAGES.PROMISE_VALUE.replace(
                    ':key',
                    parent ? `${parent}.${key}` : key,
                ),
            );
        }
        output[key] = value;
    }

    return (isSync ? output : recursiveResolve(output)) as T;
}
