import { ERROR_MESSAGES } from '../constants';
import { getValueFromNestedArray } from './general';
import { isRecord } from './guards';
import fs from 'fs';
import path from 'path';

export function validatePath(filePath: string): string {
    const resolvedPath = path.resolve(path.normalize(filePath));
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(
            ERROR_MESSAGES.PATH_DOES_NOT_EXIST.replace(
                ':filePath',
                resolvedPath,
            ),
        );
    }
    try {
        fs.accessSync(resolvedPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch {
        throw new Error(
            ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS.replace(
                ':filePath',
                resolvedPath,
            ),
        );
    }
    return resolvedPath;
}

export function validateAndNormalizeFilename(fileName: string): string {
    const extension = path.extname(fileName);
    if (!fileName) {
        throw new Error(ERROR_MESSAGES.MISSING_FILENAME);
    }
    if (!extension) {
        fileName = fileName + '.json';
    } else if (extension.toLowerCase() !== '.json') {
        throw new Error(
            ERROR_MESSAGES.INVALID_EXTENSION.replace(
                ':fileExtension',
                extension,
            ),
        );
    }
    return fileName;
}

export function readFileIfExists<T>(filePath: string): T | null {
    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, {
                encoding: 'utf-8',
            });
            return JSON.parse(data) as T;
        } catch {
            throw new Error(
                ERROR_MESSAGES.FILE_READ.replace(':filePath', filePath),
            );
        }
    }
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
