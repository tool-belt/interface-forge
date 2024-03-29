import { parseOptions } from '../../src/utils/options';

describe('parseOptions', () => {
    it('returns [undefined, undefined] when passed undefined', () => {
        expect(parseOptions(undefined, 1)).toEqual([undefined, undefined]);
    });
    it('returns [options, undefined] when passed options object', () => {
        const options = { key: 'value' };
        expect(parseOptions(options, 1)).toEqual([options, undefined]);
    });
    it('calls options function with iteration', () => {
        const options = vi.fn((iteration: number) => ({ key: iteration }));
        const result = parseOptions(options, 1);
        expect(options).toHaveBeenCalledWith(1);
        expect(result).toEqual([{ key: 1 }, undefined]);
    });
    describe('handles OverridesAndFactory object correctly', () => {
        it('returns both overrides and factory when passed both', () => {
            const overrides = { key: 'value' };
            const factory = vi.fn();
            expect(parseOptions({ factory, overrides }, 1)).toEqual([
                overrides,
                factory,
            ]);
        });
        it('returns [undefined, factory] when only factory is passed', () => {
            const factory = vi.fn();
            expect(parseOptions({ factory }, 1)).toEqual([undefined, factory]);
        });
        it('returns [overrides, undefined] when only overrides are passed', () => {
            const overrides = { key: 'value' };
            expect(parseOptions({ overrides }, 1)).toEqual([
                overrides,
                undefined,
            ]);
        });
        it('calls function overrides with iteration', () => {
            const overrides = vi.fn((iteration: number) => ({
                key: iteration,
            }));
            const factory = vi.fn();
            const result = parseOptions({ factory, overrides }, 1);
            expect(overrides).toHaveBeenCalledWith(1);
            expect(result).toEqual([{ key: 1 }, factory]);
        });
    });
});
