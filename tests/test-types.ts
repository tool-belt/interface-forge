export interface ComplexObject extends Record<string, any> {
    name: string;
    options?: Options;
    value: number | null;
}

export interface Options extends Record<string, any> {
    children?: ComplexObject[];
    type: '1' | '2' | '3' | 'all' | 'none';
}
