import { ERROR_MESSAGES } from './constants';
import { FactoryBuildOptions, FactoryFunction, FactoryOptions } from './types';
import { TypeFactory } from './type-factory';
import {
    haveSameKeyPaths,
    readFileIfExists,
    validateAndNormalizeFilename,
} from './utils/file';
import fs from 'fs';
import path from 'path';

export class FixtureFactory<T> extends TypeFactory<T> {
    private defaultPath: string | undefined;

    constructor(
        defaults: FactoryOptions<T>,
        factory?: FactoryFunction<T>,
        defaultPath?: string,
    ) {
        super(defaults, factory);
        if (defaultPath && !path.isAbsolute(defaultPath)) {
            throw new Error(ERROR_MESSAGES.PATH_IS_NOT_ABSOLUTE);
        }
        this.defaultPath = defaultPath;
    }

    private getOrCreateFixture(filePath: string, build: T | T[]): T | T[] {
        filePath = this.defaultPath
            ? path.join(this.defaultPath, filePath)
            : filePath;
        filePath = validateAndNormalizeFilename(path.join(filePath));
        const data = readFileIfExists<T>(filePath);
        try {
            if (data && haveSameKeyPaths(build, data)) {
                return data;
            }
            fs.writeFileSync(filePath, JSON.stringify(build));
            return build;
        } catch (error) {
            throw new Error(
                ERROR_MESSAGES.FILE_WRITE.replace(
                    ':filePath',
                    filePath,
                ).replace(':fileError', ': ' + JSON.stringify(error)),
            );
        }
    }

    async fixture(
        filePath: string,
        options?: FactoryBuildOptions<T>,
    ): Promise<T> {
        const instance = await this.build(options);
        return this.getOrCreateFixture(filePath, instance) as T;
    }

    fixtureSync(filePath: string, options?: FactoryBuildOptions<T>): T {
        const instance = this.buildSync(options);
        return this.getOrCreateFixture(filePath, instance) as T;
    }

    async fixtureBatch(
        filePath: string,
        size: number,
        options?: FactoryBuildOptions<T>,
    ): Promise<T[]> {
        const batch = await this.batch(size, options);
        return this.getOrCreateFixture(filePath, batch) as T[];
    }

    fixtureBatchSync(
        filePath: string,
        size: number,
        options?: FactoryBuildOptions<T>,
    ): T[] {
        const batch = this.batchSync(size, options);
        return this.getOrCreateFixture(filePath, batch) as T[];
    }
}
