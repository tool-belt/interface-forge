export interface ComplexObject extends Record<string, any> {
    name: string;
    value: number | null;
    options?: Options;
}

export interface Options extends Record<string, any> {
    type: '1' | '2' | '3' | 'all' | 'none';
    children?: ComplexObject[];
}
