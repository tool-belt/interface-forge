import { ERROR_MESSAGES } from './constants';
import {
    FactoryBuildOptions,
    FactoryFunction,
    FactoryOptions,
    FixtureStatic,
} from './types';
import { TypeFactory } from './type-factory';
import {
    deepCompareKeys,
    normalizeFilename,
    readFileIfExists,
    saveFixture,
} from './utils';
import fs from 'fs';
import fsPath from 'path';

export class FixtureFactory<T> extends TypeFactory<T> {
    private defaultPath: string;

    constructor(
        defaultPath: string,
        defaults: FactoryOptions<T>,
        factory?: FactoryFunction<T>,
    ) {
        super(defaults, factory);
        if (!defaultPath) throw new Error(ERROR_MESSAGES.MISSING_DEFAULT_PATH);
        this.defaultPath = defaultPath + '/';
        if (!fs.existsSync(defaultPath)) fs.mkdirSync(defaultPath);
    }

    static = {
        build: (path: string, options?: FactoryBuildOptions<T>): Promise<T> =>
            this.saveBuildAsync(path, options),
        buildSync: (path: string, options?: FactoryBuildOptions<T>): T =>
            this.saveBuildSync(path, options),
        batch: (
            path: string,
            size: number,
            options?: FactoryBuildOptions<T>,
        ): Promise<T[]> => this.saveBatchAsync(path, size, options),
        batchSync: (
            path: string,
            size: number,
            options?: FactoryBuildOptions<T>,
        ): T[] => this.saveBatchSync(path, size, options),
    };

    private save<R>(path: string, build: R) {
        const fileName = normalizeFilename(fsPath.join(this.defaultPath, path));
        const file = readFileIfExists<R>(fileName);
        const needsNewBuild = !file || !deepCompareKeys(build, file.data);
        if (!needsNewBuild) return (file as FixtureStatic<R>).data;

        saveFixture<R>(fileName, build);
        return build;
    }

    private async saveBuildAsync(
        path: string,
        options?: FactoryBuildOptions<T>,
    ): Promise<T> {
        const build = await this.build(options);
        return this.save<T>(path, build);
    }

    private saveBuildSync(path: string, options?: FactoryBuildOptions<T>): T {
        const build = this.buildSync(options);
        return this.save<T>(path, build);
    }

    private async saveBatchAsync(
        path: string,
        size: number,
        options?: FactoryBuildOptions<T>,
    ): Promise<T[]> {
        const build = await this.batch(size, options);
        return this.save<T[]>(path, build);
    }

    private saveBatchSync(
        path: string,
        size: number,
        options?: FactoryBuildOptions<T>,
    ): T[] {
        const build = this.batchSync(size, options);
        return this.save<T[]>(path, build);
    }
}
