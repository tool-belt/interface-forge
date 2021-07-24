import { BuildArgProxy, DerivedValueProxy } from '../type-factory';
import { ERROR_MESSAGES } from '../constants';
import { FactorySchema } from '../types';

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

export function validateFactoryResult<T>(factoryResult: T): T {
    const missingValues: string[] = [];
    Object.entries(factoryResult).forEach(([key, value]) => {
        if (value instanceof DerivedValueProxy) {
            missingValues.push(key);
        }
    });
    if (missingValues.length) {
        throw new Error(
            ERROR_MESSAGES.MISSING_DERIVED_PARAMETERS.replace(
                ':missingValues',
                missingValues.join(', '),
            ),
        );
    }
    return factoryResult;
}
