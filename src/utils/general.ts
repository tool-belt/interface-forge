import { isRecord } from './guards';

export function getValueFromNestedArray(
    arr: unknown[],
    level: number,
): [value: unknown, level: number] {
    if (!Array.isArray(arr[0])) {
        return [arr[0], level];
    }
    return getValueFromNestedArray(arr[0], level + 1);
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
