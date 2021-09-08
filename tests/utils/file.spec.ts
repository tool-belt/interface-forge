import { ComplexObject } from '../test-types';
import { ERROR_MESSAGES } from '../../src';
import {
    isSameStructure,
    mapKeyPaths,
    parseFilePath,
    readFileIfExists,
} from '../../src/utils/file';
import fs from 'fs';

const defaults: ComplexObject = {
    name: 'testObject',
    value: null,
};

const annoyinglyComplexObject: any = {
    ...{
        ...defaults,
        options: {
            type: '1',
        },
    },
    options: {
        type: '1',
        children: [
            {
                ...{
                    ...defaults,
                    options: {
                        type: '1',
                    },
                },
                options: {
                    type: '1',
                    children: [defaults],
                },
            },
        ],
        arrayOfArray: [
            [
                [
                    {
                        ...{
                            ...defaults,
                            options: {
                                type: '1',
                            },
                        },
                        options: {
                            type: '1',
                            children: [defaults],
                        },
                    },
                ],
            ],
        ],
    },
};

describe('readFileIfExists', () => {
    let existsSyncSpy: jest.SpyInstance;
    let readFileSyncSpy: jest.SpyInstance;

    beforeEach(() => {
        existsSyncSpy = jest.spyOn(fs, 'existsSync');
        readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('returns parsed file contents if file exists', () => {
        const testData = {
            'id': 0,
            'value': 'test',
            'is-JSON': true,
        };
        existsSyncSpy.mockReturnValueOnce(true);
        readFileSyncSpy.mockReturnValueOnce(JSON.stringify(testData));
        expect(readFileIfExists('filename')).toEqual(testData);
    });
    it('returns null if file does not exist', () => {
        existsSyncSpy.mockReturnValueOnce(false);
        expect(readFileIfExists('filename')).toBeNull();
    });
    it('throws custom error if file content cannot be parsed', () => {
        existsSyncSpy.mockReturnValueOnce(true);
        readFileSyncSpy.mockImplementation(() => {
            throw new Error('test');
        });
        expect(() => readFileIfExists('filename')).toThrow(
            ERROR_MESSAGES.FILE_READ.replace(':filePath', 'filename').replace(
                ':fileError',
                'Error: test',
            ),
        );
    });
});

describe('mapKeyPaths', () => {
    it('builds meaningful string[] for deep-key comparison', () => {
        const list = mapKeyPaths(annoyinglyComplexObject);
        expect(list).toEqual([
            'name',
            'value',
            'options',
            'type',
            'options.type',
            'children',
            'options.children[0].name',
            'options.children[0].value',
            'options.children[0].options.type',
            'options.children[0].options.children[0].name',
            'options.children[0].options.children[0].value',
            'arrayOfArray',
            'options.arrayOfArray[0][0][0].name',
            'options.arrayOfArray[0][0][0].value',
            'options.arrayOfArray[0][0][0].options.type',
            'options.arrayOfArray[0][0][0].options.children[0].name',
            'options.arrayOfArray[0][0][0].options.children[0].value',
        ]);
    });
});

describe('isSameStructure', () => {
    it('returns true if structure matches', () => {
        expect(isSameStructure(defaults, defaults)).toEqual(true);
    });
    it('ignores undefined values in comparison', () => {
        expect(
            isSameStructure(defaults, {
                ...defaults,
                children: undefined,
            }),
        ).toEqual(true);
    });
    it('returns false if structure does not match', () => {
        expect(
            isSameStructure(defaults, {
                ...defaults,
                children: [1, 2, 3],
            }),
        ).toEqual(false);
    });
});

describe('parseFilePath', () => {
    let existsSyncSpy: jest.SpyInstance;
    let accessSyncSpy: jest.SpyInstance;
    let mkdirSyncSpy: jest.SpyInstance;

    beforeEach(() => {
        existsSyncSpy = jest.spyOn(fs, 'existsSync');
        accessSyncSpy = jest.spyOn(fs, 'accessSync');
        mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync');
        existsSyncSpy.mockImplementation(() => true);
        accessSyncSpy.mockImplementation(() => undefined);
        mkdirSyncSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('throws an error if path is not absolute', () => {
        expect(() => parseFilePath('relative/path')).toThrow(
            ERROR_MESSAGES.PATH_IS_NOT_ABSOLUTE,
        );
    });
    it('throws an error if wrong extension', () => {
        expect(() => parseFilePath('/testfile.txt')).toThrow(
            ERROR_MESSAGES.INVALID_EXTENSION.replace(':fileExtension', '.txt'),
        );
    });
    it('throws an error if no filePath is provided', () => {
        // @ts-ignore
        expect(() => parseFilePath(undefined)).toThrow(
            ERROR_MESSAGES.MISSING_FILENAME,
        );
        expect(() => parseFilePath('')).toThrow(
            ERROR_MESSAGES.MISSING_FILENAME,
        );
        expect(() => parseFilePath(' ')).toThrow(
            ERROR_MESSAGES.MISSING_FILENAME,
        );
    });
    it('detects a file path without an extension file name', () => {
        existsSyncSpy.mockReturnValueOnce(true);
        const parsedPath = parseFilePath('/imaginary/path/name');
        expect(parsedPath.fullPath).toEqual(
            '/imaginary/path/__fixtures__/name.json',
        );
    });
    it('does not append .json extension, if provided', () => {
        const parsedPath = parseFilePath('/imaginary/path/name.json');
        expect(parsedPath.fullPath).toEqual(
            '/imaginary/path/__fixtures__/name.json',
        );
    });
    it('replaces non lower case JSON with json', () => {
        const parsedPath = parseFilePath('/imaginary/path/name.JSON');
        expect(parsedPath.fullPath).toEqual(
            '/imaginary/path/__fixtures__/name.json',
        );
    });
    it('supports .json extension with sub-dot-notation', () => {
        const parsedPath = parseFilePath('/dev/filename.some.other.info.json');
        expect(parsedPath.fullPath).toEqual(
            '/dev/__fixtures__/filename.some.other.info.json',
        );
    });
});
