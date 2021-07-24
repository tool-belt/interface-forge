import { ComplexObject } from '../test-types';
import { ERROR_MESSAGES, TypeFactory } from '../../src';
import {
    validateFactoryResult,
    validateFactorySchema,
} from '../../src/utils/validators';

const defaults: ComplexObject = {
    name: 'testObject',
    value: null,
};

describe('validateFactorySchema', () => {
    it('throws when encountering a BuildProxy instance', () => {
        expect(() =>
            validateFactorySchema<ComplexObject>({
                ...defaults,
                options: TypeFactory.required() as any,
            }),
        ).toThrow(
            ERROR_MESSAGES.MISSING_BUILD_ARGS.replace(
                ':missingArgs',
                'options',
            ),
        );
    });
    it('doesnt throw for normal values', () => {
        expect(validateFactorySchema<ComplexObject>(defaults)).toEqual(
            defaults,
        );
    });
});

describe('validateFactoryResult', () => {
    it('throws when encountering a DerivedValueProxy instance', () => {
        expect(() =>
            validateFactoryResult<ComplexObject>({
                ...defaults,
                options: TypeFactory.derived() as any,
            }),
        ).toThrow(
            ERROR_MESSAGES.MISSING_DERIVED_PARAMETERS.replace(
                ':missingValues',
                'options',
            ),
        );
    });
    it('doesnt throw for normal values', () => {
        expect(validateFactorySchema<ComplexObject>(defaults)).toEqual(
            defaults,
        );
    });
});
