import { getValueFromNestedArray } from './general';
import { isRecord } from './guards';
import fs from 'fs';

export function readFileIfExists<T>(filename: string): T | null {
    if (fs.existsSync(filename))
        return JSON.parse(fs.readFileSync(filename, 'utf-8')) as T;
    return null;
}

export function mapKeyPaths<T>(input: T, chain = ''): string[] {
    const keys = [];
    // eslint-disable-next-line prefer-const
    for (let [key, value] of Object.entries(input)) {
        keys.push(key);
        let subChain = chain ? `${chain}.${key}` : key;
        if (Array.isArray(value)) {
            // eslint-disable-next-line prefer-const
            let [nestedValue, levels] = getValueFromNestedArray<unknown>(
                value,
                1,
            );
            value = nestedValue;
            while (levels > 0) {
                levels--;
                subChain += '[0]';
            }
        }
        if (isRecord(value)) {
            keys.push(...mapKeyPaths(value, subChain));
        } else {
            keys.push(subChain);
        }
    }
    return [...new Set(keys)];
}

export function haveSameKeyPaths<T>(
    obj1: T,
    obj2: Record<string, any>,
): obj2 is T {
    return (
        JSON.stringify(mapKeyPaths(obj1).sort()) ===
        JSON.stringify(mapKeyPaths(obj2).sort())
    );
}
