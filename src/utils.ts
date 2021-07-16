import { BuildArgProxy, Ref, TypeFactory } from './type-factory';
import { ERROR_MESSAGES } from './constants';
import {
    FactoryBuildOptions,
    FactoryFunction,
    FactorySchema,
    FixtureStatic,
    OverridesAndFactory,
} from './types';
import fs from 'fs';

export function isRecord(variable: unknown): variable is Record<any, unknown> {
    const recordsStringResults = [
        '[object Object]',
        '[object Map]',
        '[object WeakMap]',
    ];
    return (
        typeof variable === 'object' &&
        variable !== null &&
        recordsStringResults.includes(variable.toString())
    );
}

export function isOfType<T>(
    variable: unknown,
    property: keyof T,
): variable is T {
    return (
        typeof variable === 'object' &&
        variable !== null &&
        Reflect.has(variable, property)
    );
}

export function isPromise<T = any>(variable: unknown): variable is Promise<T> {
    return isOfType<Promise<T>>(variable, 'then');
}

export function throwIfPromise<T>(value: T, key: string): T {
    if (isPromise(value)) {
        throw new Error(ERROR_MESSAGES.PROMISE_VALUE.replace(':key', key));
    }
    return value;
}

export function parseFactorySchemaSync<T>(
    schema: FactorySchema<T>,
    iteration: number,
): T {
    const output: Record<string, unknown> = {};
    for (const [key, rawValue] of Object.entries(schema)) {
        const value = throwIfPromise(rawValue, key);
        if (value instanceof TypeFactory) {
            output[key] = value.buildSync();
        } else if (value instanceof Ref) {
            if (value.value instanceof TypeFactory) {
                const { value: factory } = value;
                const { batch, ...options } = value.options ?? {};
                output[key] = batch
                    ? factory.batchSync(batch, options)
                    : factory.buildSync(options);
            } else {
                output[key] = value.value(iteration);
            }
        } else if (isOfType<Generator<any, any, any>>(value, 'next')) {
            output[key] = throwIfPromise(value.next().value, key);
        } else if (isRecord(value)) {
            output[key] = parseFactorySchemaSync(value, iteration);
        } else {
            output[key] = value;
        }
    }

    return output as T;
}

export async function parseFactorySchemaAsync<T>(
    schema: FactorySchema<T>,
    iteration: number,
): Promise<T> {
    const output: Record<string, unknown> = {};
    for (const [key, rawValue] of Object.entries(schema)) {
        const value = await Promise.resolve(rawValue);
        if (value instanceof TypeFactory) {
            output[key] = await value.build();
        } else if (value instanceof Ref) {
            if (value.value instanceof TypeFactory) {
                const { value: factory } = value;
                const { batch, ...options } = value.options ?? {};
                output[key] = batch
                    ? await factory.batch(batch, options)
                    : await factory.build(options);
            } else {
                output[key] = await value.value(iteration);
            }
        } else if (isOfType<Generator<any, any, any>>(value, 'next')) {
            output[key] = await value.next().value;
        } else if (typeof value === 'object' && value !== null) {
            output[key] = await parseFactorySchemaAsync(value, iteration);
        } else {
            output[key] = value;
        }
    }

    return output as T;
}

export function validateFactorySchema<T extends FactorySchema<any>>(
    schema: T,
): T {
    const missingValues: string[] = [];
    Object.entries(schema).forEach(([key, value]) => {
        if (value instanceof BuildArgProxy) {
            missingValues.push(key);
        }
    });
    if (missingValues.length) {
        throw new Error(
            ERROR_MESSAGES.MISSING_BUILD_ARGS.replace(
                ':missingArgs',
                missingValues.join(', '),
            ),
        );
    }
    return schema;
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

export function fileAppendJson(filePath: string): string {
    return filePath.split('.').pop()?.toLowerCase() === 'json'
        ? filePath
        : filePath + '.json';
}

export function throwFileError(error: NodeJS.ErrnoException | null): void {
    if (error) throw new Error('[interface-forge] ' + JSON.stringify(error));
}

export function readFileIfExists<T>(filename: string): FixtureStatic<T> | null {
    if (fs.existsSync(filename))
        return JSON.parse(
            fs.readFileSync(filename, 'utf-8'),
        ) as FixtureStatic<T>;
    return null;
}

export function saveFixture<T>(filePath: string, data: T | T[]): void {
    const structure = Array.isArray(data)
        ? listProps(data[0])
        : listProps(data);
    const save: FixtureStatic<T | T[]> = {
        data,
        structure,
    };
    fs.writeFile(filePath, JSON.stringify(save), throwFileError);
}

export function listProps(
    input: Record<string, any>,
    output: string[] = [],
    chain = '',
): string[] {
    for (const property of Object.getOwnPropertyNames(input)) {
        if (input[property] && Array.isArray(input[property])) {
            let i = 0;
            for (const item of input[property]) {
                listProps(item, output, `${chain}.${property}[${i}]`);
                i++;
            }
        } else if (input[property] && typeof input[property] === 'object') {
            listProps(input[property], output, chain + '.' + property);
        } else {
            output.push(chain + '.' + property);
        }
    }
    return output;
}

export function structuralMatch(
    obj1: Record<string, any>,
    obj2: Record<string, any>,
): boolean {
    return JSON.stringify(listProps(obj1)) === JSON.stringify(listProps(obj2));
}
