import { ComplexObject } from './test-types';
import { FixtureFactory, FixtureStatic } from '../src';
import { defaults } from './utils';
import { listProps } from '../src//utils';
import fs from 'fs';

const originalExistsSync = fs.existsSync;
const originalReadFileSync = fs.readFileSync;
const originalWriteFile = fs.writeFile;
const mockExistsSync = jest.fn();
const mockWriteFile = jest.fn();

describe('.static.build', () => {
    afterEach(() => {
        mockExistsSync.mockClear();
        mockWriteFile.mockClear();
        fs.existsSync = originalExistsSync;
        fs.readFileSync = originalReadFileSync;
        fs.writeFile = originalWriteFile;
    });
    it('returns old contents if file exists', async () => {
        mockExistsSync.mockReturnValue(true);
        const save: FixtureStatic<ComplexObject> = {
            created: 'date_created',
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
        mockExistsSync.mockReturnValue(false);
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
