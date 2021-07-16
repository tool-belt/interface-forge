import { FactoryBuildOptions, FactoryFunction, FactoryOptions } from './types';
import { TypeFactory } from './type-factory';
import {
    fileAppendJson,
    readFileIfExists,
    saveFixture,
    structuralMatch,
} from './utils';

export class FixtureFactory<T> extends TypeFactory<T> {
    private defaultPath = '';

    constructor(
        defaults: FactoryOptions<T>,
        factory?: FactoryFunction<T>,
        defaultPath?: string,
    ) {
        super(defaults, factory);
        if (defaultPath) this.defaultPath = defaultPath;
    }

    public static = {
        build: (path: string, options?: FactoryBuildOptions<T>): Promise<T> =>
            this.write(path, options),
        buildSync: (path: string, options?: FactoryBuildOptions<T>): T =>
            this.writeSync(path, options),
        batch: (
            path: string,
            size: number,
            options?: FactoryBuildOptions<T>,
        ): Promise<T[]> => this.writeBatch(path, size, options),
        batchSync: (
            path: string,
            size: number,
            options?: FactoryBuildOptions<T>,
        ): T[] => this.writeBatchSync(path, size, options),
    };

    private async write(
        path: string,
        options?: FactoryBuildOptions<T>,
    ): Promise<T> {
        const fileName = fileAppendJson(this.defaultPath + path);
        const file = readFileIfExists<T>(fileName);
        const build = await this.build(options);
        const needsNewBuild = !file || !structuralMatch(build, file.data);
        if (!needsNewBuild && !!file) return file.data;

        saveFixture<T>(fileName, build);
        return build;
    }

    private writeSync(path: string, options?: FactoryBuildOptions<T>): T {
        const fileName = fileAppendJson(this.defaultPath + path);
        const file = readFileIfExists<T>(fileName);
        const build = this.buildSync(options);
        const needsNewBuild = !file || !structuralMatch(build, file.data);
        if (!needsNewBuild && !!file) return file.data;

        saveFixture<T>(fileName, build);
        return build;
    }

    private async writeBatch(
        path: string,
        size: number,
        options?: FactoryBuildOptions<T>,
    ): Promise<T[]> {
        const fileName = fileAppendJson(this.defaultPath + path);
        const file = readFileIfExists<T[]>(fileName);
        const batch = await this.batch(size, options);
        const needsNewBuild = !file || !structuralMatch(batch[0], file.data[0]);
        if (!needsNewBuild && !!file) return file.data;

        saveFixture<T>(fileName, batch);
        return batch;
    }

    private writeBatchSync(
        path: string,
        size: number,
        options?: FactoryBuildOptions<T>,
    ): T[] {
        const fileName = fileAppendJson(this.defaultPath + path);
        const file = readFileIfExists<T[]>(fileName);
        const batch = this.batchSync(size, options);
        const needsNewBuild = !file || !structuralMatch(batch[0], file.data[0]);
        if (!needsNewBuild && !!file) return file.data;

        saveFixture<T>(fileName, batch);
        return batch;
    }
}
