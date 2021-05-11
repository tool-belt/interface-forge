import { InterfaceForge } from '../src';

interface ComplexObject {
  name: string;
  value: number | null;
  options?: Record<string, any>;
  type: '1' | '2' | 'green' | 'blue' | 'none';
  children?: ComplexObject[];
}

describe('InterfaceFactory', () => {
  const defaults: ComplexObject = {
    name: 'testObject',
    value: 0,
    type: 'none',
  };
  describe('.build', () => {
    it('builds correctly defaults object literal', async () => {
      const factory = new InterfaceForge<ComplexObject>(defaults);
      expect(await factory.build()).toStrictEqual<ComplexObject>(defaults);
    });
    it('builds correctly defaults function', async () => {
      const factory = new InterfaceForge<ComplexObject>((i) => ({
        ...defaults,
        value: i,
      }));
      expect(await factory.build()).toStrictEqual<ComplexObject>({
        ...defaults,
        value: 1,
      });
    });
    it('builds correctly with builder function', async () => {
      const factory = new InterfaceForge<ComplexObject>(
        defaults,
        (defaults, iteration) => ({
          ...defaults,
          name: 'newObject',
          value: iteration,
        }),
      );
      expect(await factory.build()).toStrictEqual<ComplexObject>({
        ...defaults,
        name: 'newObject',
        value: 1,
      });
    });
    it('parses schema correctly', async () => {
      const factory = new InterfaceForge<ComplexObject>({
        ...defaults,
        value: InterfaceForge.use(
          async () => await new Promise<number>((resolve) => resolve(99)),
        ),
      });
      expect(await factory.build()).toStrictEqual<ComplexObject>({
        ...defaults,
        value: 99,
      });
    });
  });
  describe('.batch', () => {
    it('returns an array of unique objects', async () => {
      const factory = new InterfaceForge<ComplexObject>(
        defaults,
        (defaults, iteration) => ({
          ...defaults,
          value: iteration,
        }),
      );
      const result = await factory.batch(5);
      expect(result).toBeInstanceOf(Array);
      expect(result.map(({ value }) => value)).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
