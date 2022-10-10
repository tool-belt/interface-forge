import { isRecord } from '@tool-belt/type-predicates';
import fs from 'fs';
import path from 'path';

import { ERROR_MESSAGES } from '../constants';
import { getValueFromNestedArray } from './general';

interface ParsedFilePath {
    fixturesDir: string;
    fullPath: string;
}

export function validateAbsolutePath(filePath?: string): void {
    if (!filePath?.trim()) {
        throw new Error(ERROR_MESSAGES.MISSING_FILENAME);
    }
    if (!path.isAbsolute(filePath)) {
        throw new Error(ERROR_MESSAGES.PATH_IS_NOT_ABSOLUTE);
    }
}

export function parseFilePath(filePath: string): ParsedFilePath {
    validateAbsolutePath(filePath);
    let fileName = path.basename(filePath);
    const fixturesDir = filePath.replace(fileName, '') + '__fixtures__/';
    const extension = path.extname(fileName);
    if (!extension) {
        fileName = fileName + '.json';
    } else if (extension.toLowerCase() !== '.json') {
        throw new Error(
            ERROR_MESSAGES.INVALID_EXTENSION.replace(
                ':fileExtension',
                extension,
            ),
        );
    } else if (extension !== '.json') {
        fileName = fileName.replace(extension, '.json');
    }
    return {
        fixturesDir,
        fullPath: path.join(fixturesDir, fileName),
    };
}

export function readFileIfExists<T>(filePath: string): T | null {
    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, {
                encoding: 'utf-8',
            });
            return JSON.parse(data) as T;
        } catch (error) {
            throw new Error(
                ERROR_MESSAGES.FILE_READ.replace(':filePath', filePath).replace(
                    ':fileError',
                    (error as Error).message,
                ),
            );
        }
    }
    return null;
}

export function writeFixtureFile<T>(
    build: T,
    { fixturesDir, fullPath }: ParsedFilePath,
): T {
    try {
        if (!fs.existsSync(fixturesDir)) {
            fs.mkdirSync(fixturesDir);
        }
        fs.writeFileSync(fullPath, JSON.stringify(build));
        return build;
    } catch (error) {
        throw new Error(
            ERROR_MESSAGES.FILE_WRITE.replace(':filePath', fullPath).replace(
                ':fileError',
                ': ' + JSON.stringify(error),
            ),
        );
    }
}

export function mapKeyPaths<T extends Record<string, any>>(
    input: T,
    parent = '',
): string[] {
    const keys: string[] = [];
    for (let [key, value] of Object.entries(input)) {
        if (value !== undefined) {
            keys.push(key);
        }
        let subChain = parent ? `${parent}.${key}` : key;
        if (Array.isArray(value)) {
            let [nestedValue, levels] = getValueFromNestedArray(value, 1);
            value = nestedValue;
            while (levels > 0) {
                levels--;
                subChain += '[0]';
            }
        }
        if (isRecord(value)) {
            keys.push(...mapKeyPaths(value, subChain));
        } else if (value !== undefined) {
            keys.push(subChain);
        }
    }
    return [...new Set(keys)];
}

export function isSameStructure<T extends Record<string, any>>(
    target: T,
    soute: Record<string, any>,
): soute is T {
    return (
        JSON.stringify(mapKeyPaths(target).sort()) ===
        JSON.stringify(mapKeyPaths(soute).sort())
    );
}
