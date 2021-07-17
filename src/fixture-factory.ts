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

type WriteBuildAsync<T> = (
    path: string,
    options?: FactoryBuildOptions<T>,
) => Promise<T>;
type WriteBuildSync<T> = (path: string, options?: FactoryBuildOptions<T>) => T;
type WriteBatchAsync<T> = (
    path: string,
    size: number,
    options?: FactoryBuildOptions<T>,
) => Promise<T[]>;
type WriteBatchSync<T> = (
    path: string,
    size: number,
    options?: FactoryBuildOptions<T>,
) => T[];

type PropsBuildAsync = { batch: false; synchronous: false };
type PropsBuildSync = { batch: false; synchronous: true };
type PropsBatchAsync = { batch: true; synchronous: false };
type PropsBatchSync = { batch: true; synchronous: true };

const propsBuildAsync = { batch: false, synchronous: false };
const propsBuildSync = { batch: false, synchronous: true };
const propsBatchAsync = { batch: true, synchronous: false };
const propsBatchSync = { batch: true, synchronous: true };

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

    public static = {
        build: this.saveMethod(propsBuildAsync as PropsBuildAsync),
        buildSync: this.saveMethod(propsBuildSync as PropsBuildSync),
        batch: this.saveMethod(propsBatchAsync as PropsBatchAsync),
        batchSync: this.saveMethod(propsBatchSync as PropsBatchSync),
    };

    private save<R>(path: string, build: R) {
        const fileName = normalizeFilename(fsPath.join(this.defaultPath, path));
        const file = readFileIfExists<R>(fileName);
        const needsNewBuild = !file || !deepCompareKeys(build, file.data);
        if (!needsNewBuild) return (file as FixtureStatic<R>).data;

        saveFixture<R>(fileName, build);
        return build;
    }

    private saveMethod(props: PropsBuildAsync): WriteBuildAsync<T>;
    private saveMethod(props: PropsBuildSync): WriteBuildSync<T>;
    private saveMethod(props: PropsBatchAsync): WriteBatchAsync<T>;
    private saveMethod(props: PropsBatchSync): WriteBatchSync<T>;
    private saveMethod({
        batch,
        synchronous,
    }: {
        batch: boolean;
        synchronous: boolean;
    }) {
        if (batch) {
            if (synchronous)
                return (
                    path: string,
                    size: number,
                    options?: FactoryBuildOptions<T>,
                ): T[] => {
                    const build = this.batchSync(size, options);
                    return this.save<T[]>(path, build);
                };
            return async (
                path: string,
                size: number,
                options?: FactoryBuildOptions<T>,
            ): Promise<T[]> => {
                const build = await this.batch(size, options);
                return this.save<T[]>(path, build);
            };
        }
        if (synchronous)
            return (path: string, options?: FactoryBuildOptions<T>): T => {
                const build = this.buildSync(options);
                return this.save<T>(path, build);
            };
        return async (
            path: string,
            options?: FactoryBuildOptions<T>,
        ): Promise<T> => {
            const build = await this.build(options);
            return this.save<T>(path, build);
        };
    }
}
