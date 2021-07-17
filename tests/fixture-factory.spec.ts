import { ComplexObject } from './test-types';
import { FixtureFactory } from '../src';
import { defaults } from './utils';

const mockExistsSync = jest.fn();
const mockWriteFileSync = jest.fn();
const mockMkdirSync = jest.fn();
const mockReadFileSync = jest.fn();

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    existsSync: () => mockExistsSync,
    readFileSync: () => mockReadFileSync,
    writeFileSync: () => mockWriteFileSync,
    mkdirSync: () => mockMkdirSync,
}));

describe('FixtureFactory', () => {
    it('uses default path', async () => {
        mockExistsSync.mockReturnValueOnce(true);
        mockExistsSync.mockReturnValueOnce(false);

        const factory = new FixtureFactory<ComplexObject>(
            '/dev/path/',
            () => defaults,
            undefined,
        );
        await factory.save('testfile');
        expect(mockWriteFileSync).toHaveBeenCalledWith(
            '/dev/path/testfile.json',
            '{"name":"testObject","value":null}',
        );
    });
    // it('creates default path, if it does not exist', async () => {
    //     mockExistsSync.mockReturnValue(false);
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
    //         mockExistsSync.mockReturnValueOnce(true);
    //         mockExistsSync.mockReturnValueOnce(true);
    //         mockReadFileSync.mockReturnValueOnce(JSON.stringify(defaults));
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 name: 'differentString',
    //             }),
    //         );
    //         const result = await factory.save('testfile');
    //         expect(mockExistsSync).toHaveBeenCalled();
    //         expect(result).toEqual(defaults);
    //     });
    //     it('returns new contents if file did not exist', async () => {
    //         mockExistsSync.mockReturnValueOnce(true);
    //         mockExistsSync.mockReturnValueOnce(false);
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 value: 99,
    //             }),
    //         );
    //         const result = await factory.save('testfile');
    //         expect(mockWriteFileSync).toHaveBeenCalled();
    //         expect(result.value).toEqual(99);
    //     });
    // });
    //
    // describe('.saveSync', () => {
    //     it('returns old contents if file exists', () => {
    //         mockExistsSync.mockReturnValueOnce(true);
    //         mockExistsSync.mockReturnValueOnce(true);
    //         mockReadFileSync.mockReturnValueOnce(JSON.stringify(defaults));
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 name: 'differentString',
    //             }),
    //         );
    //         const result = factory.saveSync('testfile');
    //         expect(mockExistsSync).toHaveBeenCalled();
    //         expect(result).toEqual(defaults);
    //     });
    //     it('returns new contents if file did not exist', () => {
    //         mockExistsSync.mockReturnValueOnce(false);
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 value: 99,
    //             }),
    //         );
    //         const result = factory.saveSync('testfile');
    //         expect(mockWriteFileSync).toHaveBeenCalled();
    //         expect(result.value).toEqual(99);
    //     });
    // });
    //
    // describe('.static.batch', () => {
    //     it('returns old contents if file exists', async () => {
    //         mockExistsSync.mockReturnValueOnce(true);
    //         mockExistsSync.mockReturnValueOnce(true);
    //         const save: ComplexObject[] = [defaults];
    //         const json = JSON.stringify(save);
    //         mockReadFileSync.mockReturnValueOnce(json);
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 name: 'differentString',
    //             }),
    //         );
    //         const result = await factory.saveBatch('testfile', 1);
    //         expect(mockExistsSync).toHaveBeenCalled();
    //         expect(result).toEqual([defaults]);
    //     });
    //     it('returns new contents if file did not exist', async () => {
    //         mockExistsSync.mockReturnValueOnce(true);
    //         mockExistsSync.mockReturnValueOnce(false);
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 value: 99,
    //             }),
    //         );
    //         const result = await factory.saveBatch('testfile', 1);
    //         expect(mockWriteFileSync).toHaveBeenCalled();
    //         expect(result[0].value).toEqual(99);
    //     });
    // });
    //
    // describe('.static.batchSync', () => {
    //     it('returns old contents if file exists', () => {
    //         mockExistsSync.mockReturnValueOnce(true);
    //         mockExistsSync.mockReturnValueOnce(true);
    //         const save: ComplexObject[] = [defaults];
    //         const json = JSON.stringify(save);
    //         mockReadFileSync.mockReturnValueOnce(json);
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 name: 'differentString',
    //             }),
    //         );
    //         const result = factory.saveBatchSync('testfile', 1);
    //         expect(mockExistsSync).toHaveBeenCalled();
    //         expect(result).toEqual([defaults]);
    //     });
    //     it('returns new contents if file did not exist', () => {
    //         mockExistsSync.mockReturnValueOnce(false);
    //
    //         const factory = new FixtureFactory<ComplexObject>(
    //             __dirname,
    //             () => ({
    //                 ...defaults,
    //                 value: 99,
    //             }),
    //         );
    //         const result = factory.saveBatchSync('testfile', 1);
    //         expect(mockWriteFileSync).toHaveBeenCalled();
    //         expect(result[0].value).toEqual(99);
    //     });
    // });
});
