import { isRecord } from '@tool-belt/type-predicates';

/**
 *
 * @param arr The nested array to extract the value from
 * @param level The current level of the nested array
 * @returns [value: unknown, level: number]
 */
export function getValueFromNestedArray(
    arr: unknown[],
    level: number,
): [value: unknown, level: number] {
    if (!Array.isArray(arr[0])) {
        return [arr[0], level];
    }
    return getValueFromNestedArray(arr[0], level + 1);
}

/**
 *
 * @param target The target object to merge into
 * @param {...any} sources The source objects to merge
 * @returns T
 */
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
