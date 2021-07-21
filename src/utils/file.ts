import { ERROR_MESSAGES } from '../constants';
import { getValueFromNestedArray } from './general';
import { isRecord } from './guards';
import fs from 'fs';
import path from 'path';

export function validateAndNormalizeFilename(filePath: string): string {
    if (!filePath) {
        throw new Error(ERROR_MESSAGES.MISSING_FILENAME);
    }
    if (!path.isAbsolute(filePath)) {
        throw new Error(ERROR_MESSAGES.PATH_IS_NOT_ABSOLUTE);
    }
    const extension = path.extname(filePath);
    if (!extension || ['.spec', '.test'].includes(extension.toLowerCase())) {
        filePath = filePath + '.json';
    } else if (!['.json', '.spec', '.test'].includes(extension.toLowerCase())) {
        throw new Error(
            ERROR_MESSAGES.INVALID_EXTENSION.replace(
                ':fileExtension',
                extension,
            ),
        );
    }
    filePath = filePath.replace(path.extname(filePath), '.json');
    const fileName = path.basename(filePath);
    const basePath = filePath.replace(fileName, '') + '__fixtures__/';
    try {
        fs.mkdirSync(basePath);
    } catch (error) {
        throw new Error(
            ERROR_MESSAGES.DIR_WRITE.replace(':filePath', basePath).replace(
                ':fileError',
                ': ' + JSON.stringify(error),
            ),
        );
    }
    return basePath + fileName;
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
