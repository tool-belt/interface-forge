import { ComplexObject } from './test-types';
import { FixtureFactory, FixtureStatic } from '../src';
import { defaults } from './utils';
import { listProps, throwFileError } from '../src//utils';
import fs from 'fs';

const originalExistsSync = fs.existsSync;
const originalReadFileSync = fs.readFileSync;
const originalWriteFile = fs.writeFile;
const mockExistsSync = jest.fn();
const mockWriteFile = jest.fn();

describe('TypeFactory', () => {
    it('uses default path', async () => {
        mockExistsSync.mockReturnValueOnce(false);
        fs.existsSync = mockExistsSync;
        // @ts-ignore
        fs.writeFile = mockWriteFile;
        const factory = new FixtureFactory<ComplexObject>(
            () => defaults,
            undefined,
            '/dev/path/',
        );
        await factory.static.build('testfile');
        expect(mockWriteFile).toHaveBeenCalledWith(
            '/dev/path/testfile.json',
            '{"data":{"name":"testObject","value":null},"structure":[".name",".value"]}',
            throwFileError,
        );
        mockExistsSync.mockClear();
        mockWriteFile.mockClear();
        fs.existsSync = originalExistsSync;
        fs.writeFile = originalWriteFile;
    });
});

describe('.static.build', () => {
    afterEach(() => {
        mockExistsSync.mockClear();
        mockWriteFile.mockClear();
        fs.existsSync = originalExistsSync;
        fs.readFileSync = originalReadFileSync;
        fs.writeFile = originalWriteFile;
    });
    it('returns old contents if file exists', async () => {
        mockExistsSync.mockReturnValueOnce(true);
        const save: FixtureStatic<ComplexObject> = {
            data: defaults,
            structure: listProps(defaults),
        };
        const json = JSON.stringify(save);
        fs.existsSync = mockExistsSync;
        // @ts-ignore
        fs.readFileSync = () => json;

        const factory = new FixtureFactory<ComplexObject>(() => ({
            ...defaults,
            name: 'differentString',
        }));
        const result = await factory.static.build('testfile');
        expect(mockExistsSync).toHaveBeenCalled();
        expect(result).toEqual(defaults);
    });
    it('returns new contents if file did not exist', async () => {
        mockExistsSync.mockReturnValueOnce(false);
        fs.existsSync = mockExistsSync;
        // @ts-ignore
        fs.writeFile = mockWriteFile;

        const factory = new FixtureFactory<ComplexObject>(() => ({
            ...defaults,
            value: 99,
        }));
        const result = await factory.static.build('testfile');
        expect(mockWriteFile).toHaveBeenCalled();
        expect(result.value).toEqual(99);
    });
});

describe('.static.buildSync', () => {
    afterEach(() => {
        mockExistsSync.mockClear();
        mockWriteFile.mockClear();
        fs.existsSync = originalExistsSync;
        fs.readFileSync = originalReadFileSync;
        fs.writeFile = originalWriteFile;
    });
    it('returns old contents if file exists', () => {
        mockExistsSync.mockReturnValueOnce(true);
        const save: FixtureStatic<ComplexObject> = {
            data: defaults,
            structure: listProps(defaults),
        };
        const json = JSON.stringify(save);
        fs.existsSync = mockExistsSync;
        // @ts-ignore
        fs.readFileSync = () => json;

        const factory = new FixtureFactory<ComplexObject>(() => ({
            ...defaults,
            name: 'differentString',
        }));
        const result = factory.static.buildSync('testfile');
        expect(mockExistsSync).toHaveBeenCalled();
        expect(result).toEqual(defaults);
    });
    it('returns new contents if file did not exist', () => {
        mockExistsSync.mockReturnValueOnce(false);
        fs.existsSync = mockExistsSync;
        // @ts-ignore
        fs.writeFile = mockWriteFile;

        const factory = new FixtureFactory<ComplexObject>(() => ({
            ...defaults,
            value: 99,
        }));
        const result = factory.static.buildSync('testfile');
        expect(mockWriteFile).toHaveBeenCalled();
        expect(result.value).toEqual(99);
    });
});

describe('.static.batch', () => {
    afterEach(() => {
        mockExistsSync.mockClear();
        mockWriteFile.mockClear();
        fs.existsSync = originalExistsSync;
        fs.readFileSync = originalReadFileSync;
        fs.writeFile = originalWriteFile;
    });
    it('returns old contents if file exists', async () => {
        mockExistsSync.mockReturnValueOnce(true);
        const save: FixtureStatic<ComplexObject[]> = {
            data: [defaults],
            structure: listProps(defaults),
        };
        const json = JSON.stringify(save);
        fs.existsSync = mockExistsSync;
        // @ts-ignore
        fs.readFileSync = () => json;

        const factory = new FixtureFactory<ComplexObject>(() => ({
            ...defaults,
            name: 'differentString',
        }));
        const result = await factory.static.batch('testfile', 1);
        expect(mockExistsSync).toHaveBeenCalled();
        expect(result).toEqual([defaults]);
    });
    it('returns new contents if file did not exist', async () => {
        mockExistsSync.mockReturnValueOnce(false);
        fs.existsSync = mockExistsSync;
        // @ts-ignore
        fs.writeFile = mockWriteFile;

        const factory = new FixtureFactory<ComplexObject>(() => ({
            ...defaults,
            value: 99,
        }));
        const result = await factory.static.batch('testfile', 1);
        expect(mockWriteFile).toHaveBeenCalled();
        expect(result[0].value).toEqual(99);
    });
});

describe('.static.batchSync', () => {
    afterEach(() => {
        mockExistsSync.mockClear();
        mockWriteFile.mockClear();
        fs.existsSync = originalExistsSync;
        fs.readFileSync = originalReadFileSync;
        fs.writeFile = originalWriteFile;
    });
    it('returns old contents if file exists', () => {
        mockExistsSync.mockReturnValueOnce(true);
        const save: FixtureStatic<ComplexObject[]> = {
            data: [defaults],
            structure: listProps(defaults),
        };
        const json = JSON.stringify(save);
        fs.existsSync = mockExistsSync;
        // @ts-ignore
        fs.readFileSync = () => json;

        const factory = new FixtureFactory<ComplexObject>(() => ({
            ...defaults,
            name: 'differentString',
        }));
        const result = factory.static.batchSync('testfile', 1);
        expect(mockExistsSync).toHaveBeenCalled();
        expect(result).toEqual([defaults]);
    });
    it('returns new contents if file did not exist', () => {
        mockExistsSync.mockReturnValueOnce(false);
        fs.existsSync = mockExistsSync;
        // @ts-ignore
        fs.writeFile = mockWriteFile;

        const factory = new FixtureFactory<ComplexObject>(() => ({
            ...defaults,
            value: 99,
        }));
        const result = factory.static.batchSync('testfile', 1);
        expect(mockWriteFile).toHaveBeenCalled();
        expect(result[0].value).toEqual(99);
    });
});
