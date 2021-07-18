import { ERROR_MESSAGES } from '../constants';
import { isPromise } from './guards';

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
