export class Ref<T> {
    readonly fn: (iteration: number) => Promise<T> | T;

    constructor(fn: (iteration: number) => Promise<T> | T) {
        this.fn = fn;
    }
}
