import * as fileUtils from '../src/utils/file';
import { ComplexObject } from './test-types';
import { ERROR_MESSAGES, FixtureFactory } from '../src';
import { defaults } from './utils';
import fs from 'fs';

describe('FixtureFactory', () => {
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

    describe('getOrCreateFixture', () => {
        it('throws an error on file write error', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce(null);
            writeFileSyncSpy.mockImplementationOnce(() => {
                throw new Error('');
            });
            const factory = new FixtureFactory<ComplexObject>(defaults);
            expect(() => factory.fixtureSync('testfile')).toThrow(
                ERROR_MESSAGES.FILE_WRITE.replace(':filePath', 'testfile.json'),
            );
        });
    });
    describe('.save', () => {
        it('returns old contents if file exists', async () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                name: 'differentString',
            });
            const result = await factory.fixture('testfile');
            expect(existsSyncSpy).toHaveBeenCalled();
            expect(result).toEqual(defaults);
        });
        it('returns new contents if file did not exist', async () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                value: 99,
            });
            const result = await factory.fixture('testfile');
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(result.value).toEqual(99);
        });
    });

    describe('.saveSync', () => {
        it('returns old contents if file exists', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                name: 'differentString',
            });
            const result = factory.fixtureSync('testfile');
            expect(existsSyncSpy).toHaveBeenCalled();
            expect(result).toEqual(defaults);
        });
        it('returns new contents if file did not exist', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                value: 99,
            });
            const result = factory.fixtureSync('testfile');
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(result.value).toEqual(99);
        });
    });

    describe('.saveBatch', () => {
        it('returns old contents if file exists', async () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValue([defaults]);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                name: 'differentString',
            });
            const result = await factory.fixtureBatch('testfile', 1);
            expect(existsSyncSpy).toHaveBeenCalled();
            expect(result).toEqual([defaults]);
        });
        it('returns new contents if file did not exist', async () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                value: 99,
            });
            const result = await factory.fixtureBatch('testfile', 1);
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(result[0].value).toEqual(99);
        });
    });

    describe('.saveBatchSync', () => {
        it('returns old contents if file exists', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce([defaults]);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                name: 'differentString',
            });
            const result = factory.fixtureBatchSync('testfile', 1);
            expect(existsSyncSpy).toHaveBeenCalled();
            expect(result).toEqual([defaults]);
        });
        it('returns new contents if file did not exist', () => {
            existsSyncSpy.mockReturnValueOnce(true);
            accessSyncSpy.mockReturnValueOnce(undefined);
            readFileIfExistsSpy.mockReturnValueOnce(null);

            const factory = new FixtureFactory<ComplexObject>({
                ...defaults,
                value: 99,
            });
            const result = factory.fixtureBatchSync('testfile', 1);
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(result[0].value).toEqual(99);
        });
    });
});
