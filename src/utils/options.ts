import {
    FactoryBuildOptions,
    FactoryFunction,
    FactorySchema,
    OverridesAndFactory,
} from '../types';
import { createTypeGuard, isObject } from '@tool-belt/type-predicates';

function isOverridesAndFactory<T>(
    input: unknown,
): input is OverridesAndFactory<T> {
    return createTypeGuard<OverridesAndFactory<T>>(
        (value) =>
            isObject(value) &&
            (Reflect.has(value, 'overrides') || Reflect.has(value, 'factory')),
    )(input);
}

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
    if (isOverridesAndFactory<T>(options)) {
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
