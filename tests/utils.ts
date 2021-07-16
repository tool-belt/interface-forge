import { ComplexObject } from './test-types';

export const defaults: ComplexObject = {
    name: 'testObject',
    value: null,
};

export const twoLevelDefaults: ComplexObject = {
    ...defaults,
    options: {
        type: '1',
    },
};

export const threeLevelDefaults: ComplexObject = {
    ...defaults,
    options: {
        type: '1',
        children: [defaults],
    },
};
