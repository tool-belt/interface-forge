import {
    FactoryBuildOptions,
    FactoryFunction,
    FactorySchema,
    OverridesAndFactory,
} from '../types';
import { isOfType } from './guards';

export function parseOptions<T>(
    options: FactoryBuildOptions<T> | undefined,
    iteration: number,
): [
    overrides?: FactorySchema<Partial<T>> | Promise<FactorySchema<Partial<T>>>,
    factory?: FactoryFunction<T>,
] {
    if (!options) {
        return [undefined, undefined];
    }
    if (
        isOfType<OverridesAndFactory<T>>(options, 'overrides') ||
        isOfType<OverridesAndFactory<T>>(options, 'factory')
    ) {
        const { overrides, factory } = options;
        return [
            typeof overrides === 'function' ? overrides(iteration) : overrides,
            factory,
        ];
    }

    return [
        typeof options === 'function' ? options(iteration) : options,
        undefined,
    ];
}

export function normalizeFilename(filePath: string): string {
    return filePath.toLowerCase().includes('.json')
        ? filePath
        : filePath + '.json';
}
