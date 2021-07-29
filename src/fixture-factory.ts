import { FactoryBuildOptions, FactoryDefaults, FactoryFunction } from './types';
import { TypeFactory } from './type-factory';
import {
    isSameStructure,
    parseFilePath,
    readFileIfExists,
    validateAbsolutePath,
    writeFixtureFile,
} from './utils/file';
import path from 'path';

export class FixtureFactory<T> extends TypeFactory<T> {
    private readonly defaultPath: string | undefined;

    constructor(
        defaults: FactoryDefaults<T>,
        factory?: FactoryFunction<T>,
        defaultPath?: string,
    ) {
        super(defaults, factory);
        if (defaultPath?.trim()) {
            validateAbsolutePath(defaultPath);
            this.defaultPath = defaultPath;
        }
    }

    protected getOrCreateFixture<R>(filePath: string, build: R): R {
        const parsedPath = parseFilePath(
            this.defaultPath ? path.join(this.defaultPath, filePath) : filePath,
        );
        const data = readFileIfExists<T>(parsedPath.fullPath);
        if (data && isSameStructure(build, data)) {
            return data;
        }
        return writeFixtureFile<R>(build, parsedPath);
    }

    async fixture(
        filePath: string,
        options?: FactoryBuildOptions<T>,
    ): Promise<T> {
        const instance = await this.build(options);
        return this.getOrCreateFixture(filePath, instance);
    }

    fixtureSync(filePath: string, options?: FactoryBuildOptions<T>): T {
        const instance = this.buildSync(options);
        return this.getOrCreateFixture(filePath, instance);
    }

    async fixtureBatch(
        filePath: string,
        size: number,
        options?: FactoryBuildOptions<T>,
    ): Promise<T[]> {
        const batch = await this.batch(size, options);
        return this.getOrCreateFixture(filePath, batch);
    }

    fixtureBatchSync(
        filePath: string,
        size: number,
        options?: FactoryBuildOptions<T>,
    ): T[] {
        const batch = this.batchSync(size, options);
        return this.getOrCreateFixture(filePath, batch);
    }
}
