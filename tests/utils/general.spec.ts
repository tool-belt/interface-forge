import { merge } from '../../src/utils/general';

describe('merge', () => {
    it('merged nested objects correctly', () => {
        const firstObj = {
            a: 1,
            b: 2,
            c: [],
            d: {
                a: 'abc',
                b: 3,
                c: { a: 123, b: [] },
            },
        };
        const secondObj = {
            c: 33,
            d: {
                a: 'ggg',
                c: { c: { a: 123 } },
                d: { a: [] },
            },
        };
        expect(merge(firstObj, secondObj)).toEqual({
            a: 1,
            b: 2,
            c: 33,
            d: {
                a: 'ggg',
                b: 3,
                c: {
                    a: 123,
                    b: [],
                    c: {
                        a: 123,
                    },
                },
                d: {
                    a: [],
                },
            },
        });
    });
});
