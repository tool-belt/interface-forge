import fs from 'fs';

import { ERROR_MESSAGES, FixtureFactory } from '../src';
import * as fileUtils from '../src/utils/file';
import { ComplexObject } from './test-types';

const defaults: ComplexObject = {
    name: 'testObject',
    value: null,
};

describe('FixtureFactory', () => {
    let existsSyncSpy: vi.SpyInstance;
    let writeFileSyncSpy: vi.SpyInstance;
    let mkdirSyncSpy: vi.SpyInstance;
    let readFileIfExistsSpy: vi.SpyInstance;
    let readFileSyncSpy: vi.SpyInstance;

    beforeEach(() => {
        readFileIfExistsSpy = vi.spyOn(fileUtils, 'readFileIfExists');
        readFileIfExistsSpy.mockImplementation(() => defaults);

        existsSyncSpy = vi.spyOn(fs, 'existsSync');
        mkdirSyncSpy = vi.spyOn(fs, 'mkdirSync');
        readFileSyncSpy = vi.spyOn(fs, 'readFileSync');
        writeFileSyncSpy = vi.spyOn(fs, 'writeFileSync');
        mkdirSyncSpy.mockImplementation(() => undefined);
        writeFileSyncSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getOrCreateFixture', () => {
        it('throws an error on file write error', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            readFileIfExistsSpy.mockReturnValueOnce(null);
            writeFileSyncSpy.mockImplementationOnce(() => {
                throw Error('');
            });
            const factory = new FixtureFactory<ComplexObject>(defaults);
            expect(() => factory.fixtureSync('/testfile')).toThrow(
                ERROR_MESSAGES.FILE_WRITE.replace(
                    ':filePath',
                    '/__fixtures__/testfile.json',
                ).replace(':fileError', ': {}'),
            );
        });
        it('throws an error if default file path is not absolute', () => {
            expect(
                () =>
                    new FixtureFactory<ComplexObject>(
                        defaults,
                        undefined,
                        'relative/path',
                    ),
            ).toThrow(ERROR_MESSAGES.PATH_IS_NOT_ABSOLUTE);
        });
        it('throws an error if file path is not absolute', () => {
            const factory = new FixtureFactory<ComplexObject>(defaults);
            expect(() => factory.fixtureSync('testfile')).toThrow(
                ERROR_MESSAGES.PATH_IS_NOT_ABSOLUTE,
            );
        });
        it('creates __fixtures__ dir if it does not exist', () => {
            existsSyncSpy.mockReturnValueOnce(false);
            readFileIfExistsSpy.mockReturnValueOnce(null);
            const factory = new FixtureFactory<ComplexObject>(
                defaults,
                undefined,
                '/default/path',
            );
            factory.fixtureSync('/testfile');
            expect(mkdirSyncSpy).toHaveBeenCalled();
            existsSyncSpy.mockReset();
        });
        it('joins file name with factory default path', () => {
            readFileIfExistsSpy.mockReturnValueOnce(null);
            const factory = new FixtureFactory<ComplexObject>(
                defaults,
                undefined,
                '/default/path',
            );
            factory.fixtureSync('/testfile');
            expect(writeFileSyncSpy).toHaveBeenCalledWith(
                '/default/path/__fixtures__/testfile.json',
                expect.any(String),
            );
        });
    });
    describe('.save', () => {
        it('returns old contents if file exists', async () => {
            existsSyncSpy.mockReturnValueOnce(true);
            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                name: 'differentString',
            });
            const result = await factory.fixture('/testfile');
            expect(result).toEqual(defaults);
        });
        it('returns new contents if file did not exist', async () => {
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                value: 99,
            });
            const result = await factory.fixture('/testfile');
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(result.value).toBe(99);
        });
    });

    describe('.saveSync', () => {
        it('returns old contents if file exists', () => {
            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                name: 'differentString',
            });
            const result = factory.fixtureSync('/testfile');
            expect(result).toEqual(defaults);
        });
        it('returns new contents if file did not exist', () => {
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                value: 99,
            });
            const result = factory.fixtureSync('/testfile');
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(result.value).toBe(99);
        });
    });

    describe('.saveBatch', () => {
        it('returns old contents if file exists', async () => {
            readFileIfExistsSpy.mockReturnValue([defaults]);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                name: 'differentString',
            });
            const result = await factory.fixtureBatch('/testfile', 1);
            expect(result).toEqual([defaults]);
        });
        it('returns new contents if file did not exist', async () => {
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                value: 99,
            });
            const result = await factory.fixtureBatch('/testfile', 1);
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(result[0].value).toBe(99);
        });
    });

    describe('.saveBatchSync', () => {
        it('returns old contents if file exists', () => {
            readFileIfExistsSpy.mockReturnValueOnce([defaults]);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                name: 'differentString',
            });
            const result = factory.fixtureBatchSync('/testfile', 1);
            expect(result).toEqual([defaults]);
        });
        it('returns new contents if file did not exist', () => {
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                value: 99,
            });
            const result = factory.fixtureBatchSync('/testfile', 1);
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(result[0].value).toBe(99);
        });
    });

    describe('handling of undefined values', () => {
        it('returns old contents if file exists already', () => {
            readFileIfExistsSpy.mockRestore();
            let writtenValue: string;
            writeFileSyncSpy.mockImplementation(
                (_, value) => (writtenValue = value),
            );

            const factory = new FixtureFactory<ComplexObject>(() => ({
                name: 'objectWithUndefined',
                options: undefined,
                value: Math.random(),
            }));

            existsSyncSpy.mockReturnValue(false);
            const result1 = factory.fixtureSync('/testfile');

            readFileSyncSpy.mockImplementation(() => writtenValue);
            existsSyncSpy.mockReturnValue(true);
            const result2 = factory.fixtureSync('/testfile');

            expect(result1).toEqual(result2);
        });
    });
});
