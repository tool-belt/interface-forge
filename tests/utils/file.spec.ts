import { ComplexObject } from '../test-types';
import { ERROR_MESSAGES } from '../../src';
import {
    haveSameKeyPaths,
    mapKeyPaths,
    readFileIfExists,
    validateAndNormalizeFilename,
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
        readFileSyncSpy.mockReturnValueOnce(undefined);
        expect(() => readFileIfExists('filename')).toThrow(
            ERROR_MESSAGES.FILE_READ.replace(':filePath', 'filename'),
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

describe('deepCompareKeys', () => {
    it('returns true if structure matches', () => {
        expect(haveSameKeyPaths(defaults, defaults)).toEqual(true);
    });
    it('returns false if structure does not match', () => {
        expect(
            haveSameKeyPaths(defaults, {
                ...defaults,
                children: undefined,
            }),
        ).toEqual(false);
    });
});

describe('validateAndNormalizeFilename', () => {
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

    describe('throws', () => {
        it('an error if file path is not absolute', () => {
            expect(() => validateAndNormalizeFilename('relative/path')).toThrow(
                ERROR_MESSAGES.PATH_IS_NOT_ABSOLUTE,
            );
        });
        it('throws an error if an extension other than the allowed is provided', () => {
            expect(() => validateAndNormalizeFilename('/testfile.txt')).toThrow(
                ERROR_MESSAGES.INVALID_EXTENSION.replace(
                    ':fileExtension',
                    '.txt',
                ),
            );
        });
        it('an error if empty filename is provided', () => {
            expect(() => validateAndNormalizeFilename('')).toThrow(
                ERROR_MESSAGES.MISSING_FILENAME,
            );
        });
        it('an error fixture dir cannot be created', () => {
            existsSyncSpy.mockImplementationOnce(() => false);
            mkdirSyncSpy.mockImplementationOnce(() => {
                throw new Error('');
            });
            expect(() =>
                validateAndNormalizeFilename('/imaginary/path/name'),
            ).toThrow(
                ERROR_MESSAGES.DIR_WRITE.replace(
                    ':filePath',
                    '/imaginary/path/__fixtures__/',
                ).replace(':fileError', ': {}'),
            );
        });
    });

    describe('correctly', () => {
        it('creates __fixtures__ dir if it does not exist', () => {
            existsSyncSpy.mockReturnValueOnce(false);
            validateAndNormalizeFilename('/imaginary/path/name');
            expect(mkdirSyncSpy).toHaveBeenCalled();
            existsSyncSpy.mockReset();
        });
        it('does not throw if __fixtures__ dir already exists', () => {
            expect(() =>
                validateAndNormalizeFilename('/imaginary/path/name'),
            ).not.toThrow();
            expect(mkdirSyncSpy).not.toHaveBeenCalled();
        });
        it('detects a file name at the end of the file path', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            expect(
                validateAndNormalizeFilename('/imaginary/path/name.json'),
            ).toEqual('/imaginary/path/__fixtures__/name.json');
        });
        it('detects a file path without a file name', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            expect(
                validateAndNormalizeFilename('/imaginary/path/name'),
            ).toEqual('/imaginary/path/__fixtures__/name.json');
        });
        it('does not append .json extension, if provided', () => {
            expect(validateAndNormalizeFilename('/dev/filename.JSON')).toEqual(
                '/dev/__fixtures__/filename.json',
            );
        });
        it('appends .json extension if not provided', () => {
            expect(validateAndNormalizeFilename('/dev/filename')).toEqual(
                '/dev/__fixtures__/filename.json',
            );
        });
        it('appends .json extension if .spec provided', () => {
            expect(validateAndNormalizeFilename('/dev/filename.spec')).toEqual(
                '/dev/__fixtures__/filename.spec.json',
            );
        });
        it('appends .json extension if .test provided', () => {
            expect(validateAndNormalizeFilename('/dev/filename.test')).toEqual(
                '/dev/__fixtures__/filename.test.json',
            );
        });
        it('supports .json extension with sub-dot-notation', () => {
            expect(
                validateAndNormalizeFilename(
                    '/dev/filename.some.other.info.json',
                ),
            ).toEqual('/dev/__fixtures__/filename.some.other.info.json');
        });
    });
});
