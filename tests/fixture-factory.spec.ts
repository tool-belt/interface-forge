import { ComplexObject } from './test-types';
import { FixtureFactory } from '../src';
import { defaults } from './utils';
import fs from 'fs';

describe('FixtureFactory', () => {
    let existsSyncSpy: jest.SpyInstance;
    let writeFileSyncSpy: jest.SpyInstance;
    // let readFileSyncSpy: jest.SpyInstance;
    let accessSyncSpy: jest.SpyInstance;

    beforeAll(() => {
        accessSyncSpy = jest.spyOn(fs, 'accessSync');
        existsSyncSpy = jest.spyOn(fs, 'existsSync');
        // readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
        writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync');
    });

    it('uses default path', async () => {
        existsSyncSpy.mockReturnValueOnce(true);
        accessSyncSpy.mockReturnValueOnce(undefined);
        writeFileSyncSpy.mockReturnValueOnce(undefined);

        const factory = new FixtureFactory<ComplexObject>(
            '/dev/path/',
            defaults,
        );
        await factory.save('testfile');
        expect(writeFileSyncSpy).toHaveBeenCalledWith(
            '/dev/path/testfile.json',
            '{"name":"testObject","value":null}',
        );
    });
    // it('creates default path, if it does not exist', async () => {
    //     existsSyncSpy.mockReturnValue(false);
    //
    //     const factory = new FixtureFactory<ComplexObject>(
    //         '/dev/path/',
    //         () => defaults,
    //         undefined,
    //     );
    //     await factory.save('testfile');
    //     expect(mockMkdirSync).toHaveBeenCalled();
    // });
    // describe('.save', () => {
    //     it('returns old contents if file exists', async () => {
    //         existsSyncSpy.mockReturnValueOnce(true);
    //         existsSyncSpy.mockReturnValueOnce(true);
    //         readFileSyncSpy.mockReturnValueOnce(JSON.stringify(defaults));
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 name: 'differentString',
    //             }),
    //         );
    //         const result = await factory.save('testfile');
    //         expect(existsSyncSpy).toHaveBeenCalled();
    //         expect(result).toEqual(defaults);
    //     });
    //     it('returns new contents if file did not exist', async () => {
    //         existsSyncSpy.mockReturnValueOnce(true);
    //         existsSyncSpy.mockReturnValueOnce(false);
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 value: 99,
    //             }),
    //         );
    //         const result = await factory.save('testfile');
    //         expect(writeFileSyncSpy).toHaveBeenCalled();
    //         expect(result.value).toEqual(99);
    //     });
    // });
    //
    // describe('.saveSync', () => {
    //     it('returns old contents if file exists', () => {
    //         existsSyncSpy.mockReturnValueOnce(true);
    //         existsSyncSpy.mockReturnValueOnce(true);
    //         readFileSyncSpy.mockReturnValueOnce(JSON.stringify(defaults));
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 name: 'differentString',
    //             }),
    //         );
    //         const result = factory.saveSync('testfile');
    //         expect(existsSyncSpy).toHaveBeenCalled();
    //         expect(result).toEqual(defaults);
    //     });
    //     it('returns new contents if file did not exist', () => {
    //         existsSyncSpy.mockReturnValueOnce(false);
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 value: 99,
    //             }),
    //         );
    //         const result = factory.saveSync('testfile');
    //         expect(writeFileSyncSpy).toHaveBeenCalled();
    //         expect(result.value).toEqual(99);
    //     });
    // });
    //
    // describe('.static.batch', () => {
    //     it('returns old contents if file exists', async () => {
    //         existsSyncSpy.mockReturnValueOnce(true);
    //         existsSyncSpy.mockReturnValueOnce(true);
    //         const save: ComplexObject[] = [defaults];
    //         const json = JSON.stringify(save);
    //         readFileSyncSpy.mockReturnValueOnce(json);
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 name: 'differentString',
    //             }),
    //         );
    //         const result = await factory.saveBatch('testfile', 1);
    //         expect(existsSyncSpy).toHaveBeenCalled();
    //         expect(result).toEqual([defaults]);
    //     });
    //     it('returns new contents if file did not exist', async () => {
    //         existsSyncSpy.mockReturnValueOnce(true);
    //         existsSyncSpy.mockReturnValueOnce(false);
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 value: 99,
    //             }),
    //         );
    //         const result = await factory.saveBatch('testfile', 1);
    //         expect(writeFileSyncSpy).toHaveBeenCalled();
    //         expect(result[0].value).toEqual(99);
    //     });
    // });
    //
    // describe('.static.batchSync', () => {
    //     it('returns old contents if file exists', () => {
    //         existsSyncSpy.mockReturnValueOnce(true);
    //         existsSyncSpy.mockReturnValueOnce(true);
    //         const save: ComplexObject[] = [defaults];
    //         const json = JSON.stringify(save);
    //         readFileSyncSpy.mockReturnValueOnce(json);
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 name: 'differentString',
    //             }),
    //         );
    //         const result = factory.saveBatchSync('testfile', 1);
    //         expect(existsSyncSpy).toHaveBeenCalled();
    //         expect(result).toEqual([defaults]);
    //     });
    //     it('returns new contents if file did not exist', () => {
    //         existsSyncSpy.mockReturnValueOnce(false);
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 value: 99,
    //             }),
    //         );
    //         const result = factory.saveBatchSync('testfile', 1);
    //         expect(writeFileSyncSpy).toHaveBeenCalled();
    //         expect(result[0].value).toEqual(99);
    //     });
    // });
});
