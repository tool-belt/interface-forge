import * as fileUtils from '../src/utils/file';
import { ComplexObject } from './test-types';
import { ERROR_MESSAGES, FixtureFactory } from '../src';
import { defaults } from './utils';
import fs from 'fs';

describe('FixtureFactory', () => {
    const devPath = '/dev/path';
    let existsSyncSpy: jest.SpyInstance;
    let writeFileSyncSpy: jest.SpyInstance;
    let readFileIfExistsSpy: jest.SpyInstance;
    let accessSyncSpy: jest.SpyInstance;

    beforeEach(() => {
        readFileIfExistsSpy = jest.spyOn(fileUtils, 'readFileIfExists');
        readFileIfExistsSpy.mockImplementation(() => defaults);

        accessSyncSpy = jest.spyOn(fs, 'accessSync');
        existsSyncSpy = jest.spyOn(fs, 'existsSync');
        writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync');
        writeFileSyncSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('uses default path', async () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>(
                devPath,
                defaults,
            );
            await factory.save('testfile');
            expect(writeFileSyncSpy).toHaveBeenCalledWith(
                '/dev/path/testfile.json',
                JSON.stringify(defaults),
            );
        });
        it('throws error if specified path does not exist', () => {
            existsSyncSpy.mockReturnValue(false);
            expect(
                () => new FixtureFactory<ComplexObject>(devPath, defaults),
            ).toThrow(
                ERROR_MESSAGES.PATH_DOES_NOT_EXIST.replace(
                    ':filePath',
                    devPath,
                ),
            );
        });
        it('throws error if no file read/write permissions for specified path', () => {
            existsSyncSpy.mockReturnValue(true);
            accessSyncSpy.mockImplementation(() => {
                throw new Error();
            });
            expect(
                () => new FixtureFactory<ComplexObject>(devPath, defaults),
            ).toThrow(
                ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS.replace(
                    ':filePath',
                    devPath,
                ),
            );
        });
    });
    describe('getOrCreateFixture', () => {
        it('throws an error on file write error', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce(null);
            writeFileSyncSpy.mockImplementationOnce(() => {
                throw new Error('');
            });
            const factory = new FixtureFactory<ComplexObject>(
                __dirname,
                defaults,
            );
            expect(() => factory.saveSync('testfile')).toThrow(
                ERROR_MESSAGES.FILE_WRITE.replace(':filePath', __dirname),
            );
        });
    });
    describe('.save', () => {
        it('returns old contents if file exists', async () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);

            const factory = new FixtureFactory<ComplexObject>(__dirname, {
                ...defaults,
                name: 'differentString',
            });
            const result = await factory.save('testfile');
            expect(existsSyncSpy).toHaveBeenCalled();
            expect(result).toEqual(defaults);
        });
        it('returns new contents if file did not exist', async () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>(__dirname, {
                ...defaults,
                value: 99,
            });
            const result = await factory.save('testfile');
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(result.value).toEqual(99);
        });
    });

    describe('.saveSync', () => {
        it('returns old contents if file exists', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);

            const factory = new FixtureFactory<ComplexObject>(__dirname, {
                ...defaults,
                name: 'differentString',
            });
            const result = factory.saveSync('testfile');
            expect(existsSyncSpy).toHaveBeenCalled();
            expect(result).toEqual(defaults);
        });
        it('returns new contents if file did not exist', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>(__dirname, {
                ...defaults,
                value: 99,
            });
            const result = factory.saveSync('testfile');
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(result.value).toEqual(99);
        });
    });

    describe('.saveBatch', () => {
        it('returns old contents if file exists', async () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValue([defaults]);

            const factory = new FixtureFactory<ComplexObject>(__dirname, {
                ...defaults,
                name: 'differentString',
            });
            const result = await factory.saveBatch('testfile', 1);
            expect(existsSyncSpy).toHaveBeenCalled();
            expect(result).toEqual([defaults]);
        });
        it('returns new contents if file did not exist', async () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>(__dirname, {
                ...defaults,
                value: 99,
            });
            const result = await factory.saveBatch('testfile', 1);
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(result[0].value).toEqual(99);
        });
    });

    describe('.saveBatchSync', () => {
        it('returns old contents if file exists', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce([defaults]);

            const factory = new FixtureFactory<ComplexObject>(__dirname, {
                ...defaults,
                name: 'differentString',
            });
            const result = factory.saveBatchSync('testfile', 1);
            expect(existsSyncSpy).toHaveBeenCalled();
            expect(result).toEqual([defaults]);
        });
        it('returns new contents if file did not exist', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>(__dirname, {
                ...defaults,
                value: 99,
            });
            const result = factory.saveBatchSync('testfile', 1);
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(result[0].value).toEqual(99);
        });
    });
});
