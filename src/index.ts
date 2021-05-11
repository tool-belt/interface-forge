import merge from 'merge-deep';
import {
  FactoryDefaults,
  FactoryFunction,
  FactoryOptions,
  FactorySchema,
} from './types';
import { BoundGenerator } from './bound-generator';
import { isOfType } from './utils';

export class InterfaceForge<T> {
  defaults: FactoryDefaults<T>;
  factory?: FactoryFunction<T>;

  constructor(defaults: FactoryDefaults<T>, factory?: FactoryFunction<T>) {
    this.defaults = defaults;
    this.factory = factory;
  }

  private async _parse_schema(schema: FactorySchema<T>): Promise<T> {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema)) {
      if (value instanceof InterfaceForge) {
        output[key] = await value.build();
      } else if (value instanceof BoundGenerator) {
        output[key] = await value.call({ ...schema });
      } else if (isOfType<Generator<any, any, any>>(value, 'next')) {
        output[key] = value.next();
      } else {
        output[key] = value;
      }
    }
    return output as T;
  }

  async build(options?: Partial<FactoryOptions<T>>, iteration = 1): Promise<T> {
    const defaults =
      typeof this.defaults === 'function'
        ? await this.defaults(iteration)
        : this.defaults;
    const value = await this._parse_schema(
      options?.values ? merge({}, defaults, options.values) : defaults,
    );
    const factory = options?.factory ? options.factory : this.factory;
    return factory ? factory(value, iteration) : value;
  }

  async batch(batchSize: number, options?: FactoryOptions<T>): Promise<T[]> {
    return Promise.all(
      new Array(batchSize).fill(null).map((_, i) => this.build(options, i + 1)),
    );
  }

  static use<P>(fn: (values: any) => Promise<P> | P): BoundGenerator<P> {
    return new BoundGenerator<P>(fn);
  }

  static bind<P>(
    forgeInstance: InterfaceForge<P>,
    options: Partial<FactoryOptions<P>>,
  ): BoundGenerator<P> {
    return new BoundGenerator<P>((iteration: number) =>
      forgeInstance.build(options, iteration),
    );
  }

  static iterate<P>(list: P[]): Generator<P, P, P> {
    return (function* () {
      let counter = 0;
      while (true) {
        if (counter === list.length - 1) {
          counter = -1;
          yield list[counter];
        } else {
          counter++;
          yield list[counter];
        }
      }
    })();
  }
}
