import { ERROR_MESSAGES, Factory } from '../../src';
import {
    validateFactoryResult,
    validateFactorySchema,
} from '../../src/utils/validators';
import { ComplexObject } from '../test-types';

const defaults: ComplexObject = {
    name: 'testObject',
    value: null,
};

describe('validateFactorySchema', () => {
    it('throws when encountering a BuildProxy instance', () => {
        expect(() =>
            validateFactorySchema<ComplexObject>({
                ...defaults,
                options: Factory.required() as any,
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
    it('validates nested objects', () => {
        expect(() =>
            validateFactorySchema<any>({
                ...defaults,
                nested: { ...defaults, options: Factory.required() as any },
                topLevel: Factory.required(),
            }),
        ).toThrow(
            ERROR_MESSAGES.MISSING_BUILD_ARGS.replace(
                ':missingArgs',
                'nested.options, topLevel',
            ),
        );
    });
});

describe('validateFactoryResult', () => {
    it('throws when encountering a DerivedValueProxy instance', () => {
        expect(() =>
            validateFactoryResult<ComplexObject>({
                ...defaults,
                options: Factory.derived() as any,
            }),
        ).toThrow(
            ERROR_MESSAGES.MISSING_DERIVED_PARAMETERS.replace(
                ':missingValues',
                'options',
            ),
        );
    });
    it('doesnt throw for normal values', () => {
        expect(validateFactoryResult<ComplexObject>(defaults)).toEqual(
            defaults,
        );
    });
    it('validates nested objects', () => {
        expect(() =>
            validateFactoryResult<any>({
                ...defaults,
                nested: { ...defaults, options: Factory.derived() as any },
                topLevel: Factory.derived(),
            }),
        ).toThrow(
            ERROR_MESSAGES.MISSING_DERIVED_PARAMETERS.replace(
                ':missingValues',
                'nested.options, topLevel',
            ),
        );
    });
});
