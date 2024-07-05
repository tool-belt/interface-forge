import path from 'node:path';

import { Factory } from './factory';
import { FactoryBuildOptions, FactoryDefaults, FactoryFunction } from './types';
import {
    isSameStructure,
    parseFilePath,
    readFileIfExists,
    validateAbsolutePath,
    writeFixtureFile,
} from './utils/file';

export class FixtureFactory<T extends Record<string, any>> extends Factory<T> {
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

    protected getOrCreateFixture<R extends Record<string, any>>(
        filePath: string,
        build: R,
    ): R {
        const parsedPath = parseFilePath(
            this.defaultPath ? path.join(this.defaultPath, filePath) : filePath,
        );
        const data = readFileIfExists<T>(parsedPath.fullPath);
        if (data && isSameStructure(build, data)) {
            return data as R;
        }
        return writeFixtureFile<R>(build, parsedPath);
    }

    async fixture(
        filePath: string,
        options?: FactoryBuildOptions<T>,
    ): Promise<T> {
        const instance = await this.buildAsync(options);
        return this.getOrCreateFixture(filePath, instance);
    }

    fixtureSync(filePath: string, options?: FactoryBuildOptions<T>): T {
        const instance = this.build(options);
        return this.getOrCreateFixture(filePath, instance);
    }

    async fixtureBatch(
        filePath: string,
        size: number,
        options?: FactoryBuildOptions<T>,
    ): Promise<T[]> {
        const batch = await this.batchAsync(size, options);
        return this.getOrCreateFixture(filePath, batch);
    }

    fixtureBatchSync(
        filePath: string,
        size: number,
        options?: FactoryBuildOptions<T>,
    ): T[] {
        const batch = this.batch(size, options);
        return this.getOrCreateFixture(filePath, batch);
    }
}
