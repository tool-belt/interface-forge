import {
    FactoryBuildOptions,
    FactoryFunction,
    FactoryOptions,
    FixtureStatic,
} from './types';
import { TypeFactory } from './type-factory';
import {
    fileAppendJson,
    readFileIfExists,
    saveFixture,
    structuralMatch,
} from './utils';

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
        build: this.writeMethod(propsBuildAsync as PropsBuildAsync),
        buildSync: this.writeMethod(propsBuildSync as PropsBuildSync),
        batch: this.writeMethod(propsBatchAsync as PropsBatchAsync),
        batchSync: this.writeMethod(propsBatchSync as PropsBatchSync),
    };

    private save<R>(path: string, build: R) {
        const fileName = fileAppendJson(this.defaultPath + path);
        const file = readFileIfExists<R>(fileName);
        const needsNewBuild = !file || !structuralMatch(build, file.data);
        if (!needsNewBuild) return (file as FixtureStatic<R>).data;

        saveFixture<R>(fileName, build);
        return build;
    }

    private writeMethod(props: PropsBuildAsync): WriteBuildAsync<T>;
    private writeMethod(props: PropsBuildSync): WriteBuildSync<T>;
    private writeMethod(props: PropsBatchAsync): WriteBatchAsync<T>;
    private writeMethod(props: PropsBatchSync): WriteBatchSync<T>;
    private writeMethod({
        batch,
        synchronous,
    }: {
        batch: boolean;
        synchronous: boolean;
    }) {
        if (!batch) {
            if (!synchronous)
                return async (
                    path: string,
                    options?: FactoryBuildOptions<T>,
                ): Promise<T> => {
                    const build = await this.build(options);
                    return this.save<T>(path, build);
                };
            if (synchronous)
                return (path: string, options?: FactoryBuildOptions<T>): T => {
                    const build = this.buildSync(options);
                    return this.save<T>(path, build);
                };
        }
        if (!synchronous)
            return async (
                path: string,
                size: number,
                options?: FactoryBuildOptions<T>,
            ): Promise<T[]> => {
                const build = await this.batch(size, options);
                return this.save<T[]>(path, build);
            };
        return (
            path: string,
            size: number,
            options?: FactoryBuildOptions<T>,
        ): T[] => {
            const build = this.batchSync(size, options);
            return this.save<T[]>(path, build);
        };
    }
}
