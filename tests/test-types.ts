export interface ComplexObject {
    name: string;
    value: number | null;
    options?: Options;
}

export interface Options {
    type: '1' | '2' | '3' | 'all' | 'none';
    children?: ComplexObject[];
}
