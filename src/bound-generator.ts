export class BoundGenerator<T> {
  readonly fn: (values: any) => Promise<T> | T;

  constructor(fn: (values: any) => Promise<T> | T) {
    this.fn = fn;
  }

  async call(values: any): Promise<T> {
    return this.fn(values);
  }
}
