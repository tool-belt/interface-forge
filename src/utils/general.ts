import { ERROR_MESSAGES } from '../constants';
import { isPromise, isRecord } from './guards';

export function throwIfPromise<T>(value: T, key: string): T {
    if (isPromise(value)) {
        throw new Error(ERROR_MESSAGES.PROMISE_VALUE.replace(':key', key));
    }
    return value;
}

export function getValueFromNestedArray<T = unknown>(
    arr: T[],
    level: number,
): [value: T, level: number] {
    if (!Array.isArray(arr[0])) {
        return [arr[0], level];
    }
    return getValueFromNestedArray<T>(arr[0], level + 1);
}

export function merge<T>(target: T, ...sources: any[]): T {
    const output: Partial<T> = { ...target };
    for (const source of sources.filter(Boolean) as Partial<T>[]) {
        for (const [key, value] of Object.entries(source)) {
            const existingValue: unknown = Reflect.get(output, key);
            if (isRecord(value) && isRecord(existingValue)) {
                Reflect.set(output, key, merge(existingValue, value));
            } else {
                Reflect.set(output, key, value);
            }
        }
    }
    return output as T;
}
