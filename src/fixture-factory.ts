import { ERROR_MESSAGES } from './constants';
import { FactoryBuildOptions, FactoryFunction, FactoryOptions } from './types';
import { TypeFactory } from './type-factory';
import {
    haveSameKeyPaths,
    readFileIfExists,
    validateAndNormalizeFilename,
    validatePath,
} from './utils/file';
import fs from 'fs';
import path from 'path';

export class FixtureFactory<T> extends TypeFactory<T> {
    private readonly filePath: string;

    constructor(
        filePath: string,
        defaults: FactoryOptions<T>,
        factory?: FactoryFunction<T>,
    ) {
        if (!filePath) {
            throw new Error(ERROR_MESSAGES.MISSING_DEFAULT_PATH);
        }
        super(defaults, factory);
        this.filePath = validatePath(filePath);
    }

    private getOrCreateFixture(fileName: string, build: T | T[]): T | T[] {
        const filePath = path.join(
            this.filePath,
            validateAndNormalizeFilename(fileName),
        );
        try {
            const data = readFileIfExists<T>(filePath);
            if (data && haveSameKeyPaths(build, data)) {
                return data;
            }
            fs.writeFileSync(filePath, JSON.stringify(build));
            return build;
        } catch (error) {
            throw new Error(
                ERROR_MESSAGES.FILE_WRITE.replace(':filePath', filePath),
            );
        }
    }

    async save(fileName: string, options?: FactoryBuildOptions<T>): Promise<T> {
        const instance = await this.build(options);
        return this.getOrCreateFixture(fileName, instance) as T;
    }

    saveSync(fileName: string, options?: FactoryBuildOptions<T>): T {
        const instance = this.buildSync(options);
        return this.getOrCreateFixture(fileName, instance) as T;
    }

    async saveBatch(
        fileName: string,
        size: number,
        options?: FactoryBuildOptions<T>,
    ): Promise<T[]> {
        const batch = await this.batch(size, options);
        return this.getOrCreateFixture(fileName, batch) as T[];
    }

    saveBatchSync(
        fileName: string,
        size: number,
        options?: FactoryBuildOptions<T>,
    ): T[] {
        const batch = this.batchSync(size, options);
        return this.getOrCreateFixture(fileName, batch) as T[];
    }
}
