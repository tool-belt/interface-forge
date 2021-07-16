import { ComplexObject } from './test-types';
import { FixtureFactory, FixtureStatic } from '../src';
import { defaults } from './utils';
import { listProps, throwFileError } from '../src//utils';
import fs from 'fs';

const originalExistsSync = fs.existsSync;
const originalReadFileSync = fs.readFileSync;
const originalWriteFile = fs.writeFile;
const originalMkdirSync = fs.mkdirSync;
const mockExistsSync = jest.fn();
const mockWriteFile = jest.fn();
const mockMkdirSync = jest.fn();
const mockReadFileSync = jest.fn();

function setUp() {
    fs.existsSync = mockExistsSync;
    fs.readFileSync = mockReadFileSync;
    // @ts-ignore
    fs.writeFile = mockWriteFile;
    fs.mkdirSync = mockMkdirSync;
}

function tearDown() {
    mockExistsSync.mockReset();
    mockReadFileSync.mockReset();
    mockWriteFile.mockReset();
    mockMkdirSync.mockReset();
    fs.existsSync = originalExistsSync;
    fs.readFileSync = originalReadFileSync;
    fs.writeFile = originalWriteFile;
    fs.mkdirSync = originalMkdirSync;
}

describe('TypeFactory', () => {
    beforeEach(() => {
        setUp();
    });
    afterEach(() => {
        tearDown();
    });
    it('uses default path', async () => {
        mockExistsSync.mockReturnValueOnce(true);
        mockExistsSync.mockReturnValueOnce(false);

        const factory = new FixtureFactory<ComplexObject>(
            '/dev/path/',
            () => defaults,
            undefined,
        );
        await factory.static.build('testfile');
        expect(mockWriteFile).toHaveBeenCalledWith(
            '/dev/path/testfile.json',
            '{"data":{"name":"testObject","value":null},"structure":[".name",".value"]}',
            throwFileError,
        );
    });
    it('creates default path, if it does not exist', async () => {
        mockExistsSync.mockReturnValue(false);

        const factory = new FixtureFactory<ComplexObject>(
            '/dev/path/',
            () => defaults,
            undefined,
        );
        await factory.static.build('testfile');
        expect(mockMkdirSync).toHaveBeenCalled();
    });
});

describe('.static.build', () => {
    beforeEach(() => {
        setUp();
    });
    afterEach(() => {
        tearDown();
    });
    it('returns old contents if file exists', async () => {
        mockExistsSync.mockReturnValueOnce(true);
        mockExistsSync.mockReturnValueOnce(true);
        const save: FixtureStatic<ComplexObject> = {
            data: defaults,
            structure: listProps(defaults),
        };
        const json = JSON.stringify(save);
        mockReadFileSync.mockReturnValueOnce(json);

        const factory = new FixtureFactory<ComplexObject>(__dirname, () => ({
            ...defaults,
            name: 'differentString',
        }));
        const result = await factory.static.build('testfile');
        expect(mockExistsSync).toHaveBeenCalled();
        expect(result).toEqual(defaults);
    });
    it('returns new contents if file did not exist', async () => {
        mockExistsSync.mockReturnValueOnce(true);
        mockExistsSync.mockReturnValueOnce(false);

        const factory = new FixtureFactory<ComplexObject>(__dirname, () => ({
            ...defaults,
            value: 99,
        }));
        const result = await factory.static.build('testfile');
        expect(mockWriteFile).toHaveBeenCalled();
        expect(result.value).toEqual(99);
    });
});

describe('.static.buildSync', () => {
    beforeEach(() => {
        setUp();
    });
    afterEach(() => {
        tearDown();
    });
    it('returns old contents if file exists', () => {
        mockExistsSync.mockReturnValueOnce(true);
        mockExistsSync.mockReturnValueOnce(true);
        const save: FixtureStatic<ComplexObject> = {
            data: defaults,
            structure: listProps(defaults),
        };
        const json = JSON.stringify(save);
        mockReadFileSync.mockReturnValueOnce(json);

        const factory = new FixtureFactory<ComplexObject>(__dirname, () => ({
            ...defaults,
            name: 'differentString',
        }));
        const result = factory.static.buildSync('testfile');
        expect(mockExistsSync).toHaveBeenCalled();
        expect(result).toEqual(defaults);
    });
    it('returns new contents if file did not exist', () => {
        mockExistsSync.mockReturnValueOnce(false);

        const factory = new FixtureFactory<ComplexObject>(__dirname, () => ({
            ...defaults,
            value: 99,
        }));
        const result = factory.static.buildSync('testfile');
        expect(mockWriteFile).toHaveBeenCalled();
        expect(result.value).toEqual(99);
    });
});

describe('.static.batch', () => {
    beforeEach(() => {
        setUp();
    });
    afterEach(() => {
        tearDown();
    });
    it('returns old contents if file exists', async () => {
        mockExistsSync.mockReturnValueOnce(true);
        mockExistsSync.mockReturnValueOnce(true);
        const save: FixtureStatic<ComplexObject[]> = {
            data: [defaults],
            structure: listProps(defaults),
        };
        const json = JSON.stringify(save);
        mockReadFileSync.mockReturnValueOnce(json);

        const factory = new FixtureFactory<ComplexObject>(__dirname, () => ({
            ...defaults,
            name: 'differentString',
        }));
        const result = await factory.static.batch('testfile', 1);
        expect(mockExistsSync).toHaveBeenCalled();
        expect(result).toEqual([defaults]);
    });
    it('returns new contents if file did not exist', async () => {
        mockExistsSync.mockReturnValueOnce(true);
        mockExistsSync.mockReturnValueOnce(false);

        const factory = new FixtureFactory<ComplexObject>(__dirname, () => ({
            ...defaults,
            value: 99,
        }));
        const result = await factory.static.batch('testfile', 1);
        expect(mockWriteFile).toHaveBeenCalled();
        expect(result[0].value).toEqual(99);
    });
});

describe('.static.batchSync', () => {
    beforeEach(() => {
        setUp();
    });
    afterEach(() => {
        tearDown();
    });
    it('returns old contents if file exists', () => {
        mockExistsSync.mockReturnValueOnce(true);
        mockExistsSync.mockReturnValueOnce(true);
        const save: FixtureStatic<ComplexObject[]> = {
            data: [defaults],
            structure: listProps(defaults),
        };
        const json = JSON.stringify(save);
        mockReadFileSync.mockReturnValueOnce(json);

        const factory = new FixtureFactory<ComplexObject>(__dirname, () => ({
            ...defaults,
            name: 'differentString',
        }));
        const result = factory.static.batchSync('testfile', 1);
        expect(mockExistsSync).toHaveBeenCalled();
        expect(result).toEqual([defaults]);
    });
    it('returns new contents if file did not exist', () => {
        mockExistsSync.mockReturnValueOnce(false);

        const factory = new FixtureFactory<ComplexObject>(__dirname, () => ({
            ...defaults,
            value: 99,
        }));
        const result = factory.static.batchSync('testfile', 1);
        expect(mockWriteFile).toHaveBeenCalled();
        expect(result[0].value).toEqual(99);
    });
});
