export class Ref<T> {
    readonly fn: (values: any) => Promise<T> | T;

    constructor(
        fn: (values: any) => Promise<T> | T,
    ) {
        this.fn = fn
    }
}
