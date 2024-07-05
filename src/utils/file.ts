import fs from 'node:fs';
import path from 'node:path';

import { isRecord } from '@tool-belt/type-predicates';

import { ERROR_MESSAGES } from '../constants';
import { getValueFromNestedArray } from './general';

interface ParsedFilePath {
    fixturesDir: string;
    fullPath: string;
}

/**
 *
 * @param filePath The path to the file to validate
 */
export function validateAbsolutePath(filePath?: string): void {
    if (!filePath?.trim()) {
        throw new Error(ERROR_MESSAGES.MISSING_FILENAME);
    }
    if (!path.isAbsolute(filePath)) {
        throw new Error(ERROR_MESSAGES.PATH_IS_NOT_ABSOLUTE);
    }
}

/**
 *
 * @param filePath The path to the file to parse
 * @returns ParsedFilePath
 */
export function parseFilePath(filePath: string): ParsedFilePath {
    validateAbsolutePath(filePath);
    let fileName = path.basename(filePath);
    const fixturesDir = `${filePath.replace(fileName, '')}__fixtures__/`;
    const extension = path.extname(fileName);
    if (!extension) {
        fileName = `${fileName}.json`;
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

/**
 *
 * @param filePath The path to the file to read
 * @returns T | null
 */
export function readFileIfExists<T>(filePath: string): T | null {
    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, {
                encoding: 'utf8',
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

/**
 *
 * @param build The object to write to the file
 * @param ParsedFilePath The parsed file path
 * @param ParsedFilePath.fixturesDir The directory to write the file to
 * @param ParsedFilePath.fullPath The full path to the file to write
 * @returns T
 */
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
                `: ${JSON.stringify(error)}`,
            ),
        );
    }
}

/**
 *
 * @param input The object to map key paths from
 * @param parent The parent key path
 * @returns string[]
 */
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

/**
 *
 * @param target The target object to compare
 * @param source The source object to compare
 * @returns boolean
 */
export function isSameStructure<T extends Record<string, any>>(
    target: T,
    source: Record<string, any>,
): source is T {
    return (
        JSON.stringify(mapKeyPaths(target).sort()) ===
        JSON.stringify(mapKeyPaths(source).sort())
    );
}
