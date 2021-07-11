import { iterate, sample } from '../src';

describe('iterate', () => {
    const arr = [1, 2, 3];
    it('cycles through values correctly with Array and Set', () => {
        for (const arrayLike of [arr, new Set(arr)]) {
            const generator = iterate(arrayLike);
            expect(generator.next().value).toEqual(1);
            expect(generator.next().value).toEqual(2);
            expect(generator.next().value).toEqual(3);
            expect(generator.next().value).toEqual(1);
            expect(generator.next().value).toEqual(2);
            expect(generator.next().value).toEqual(3);
        }
    });
    it('cycles through values correctly with String', () => {
        const generator = iterate('abc');
        expect(generator.next().value).toEqual('a');
        expect(generator.next().value).toEqual('b');
        expect(generator.next().value).toEqual('c');
        expect(generator.next().value).toEqual('a');
        expect(generator.next().value).toEqual('b');
        expect(generator.next().value).toEqual('c');
    });
    it('cycles through values correctly with Map', () => {
        const generator = iterate(
            new Map([
                ['key1', 'value1'],
                ['key2', 'value2'],
                ['key3', 'value3'],
            ]),
        );
        expect(generator.next().value).toEqual(['key1', 'value1']);
        expect(generator.next().value).toEqual(['key2', 'value2']);
        expect(generator.next().value).toEqual(['key3', 'value3']);
        expect(generator.next().value).toEqual(['key1', 'value1']);
        expect(generator.next().value).toEqual(['key2', 'value2']);
        expect(generator.next().value).toEqual(['key3', 'value3']);
    });
});

describe('sample', () => {
    it('samples values correctly with long iterable', () => {
        const arr = [1, 2, 3];
        for (const iterable of [arr, new Set(arr), arr.join()]) {
            const generator = sample(iterable as Iterable<any>);
            const value1 = generator.next().value;
            const value2 = generator.next().value;
            expect(value1).not.toEqual(value2);
        }
    });
    it('samples values correctly with 1 length iterable', () => {
        const arr = [1];
        for (const iterable of [arr, new Set(arr), arr.join()]) {
            const generator = sample(iterable as Iterable<any>);
            const value1 = generator.next().value;
            const value2 = generator.next().value;
            expect(value1).toEqual(value2);
        }
    });
});
