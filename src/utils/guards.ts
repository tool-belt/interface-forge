export function isRecord(variable: unknown): variable is Record<any, unknown> {
    const recordsStringResults = [
        '[object Object]',
        '[object Map]',
        '[object WeakMap]',
    ];
    return (
        typeof variable === 'object' &&
        variable !== null &&
        recordsStringResults.includes(variable.toString())
    );
}

export function isOfType<T>(
    variable: unknown,
    property: keyof T,
): variable is T {
    return (
        typeof variable === 'object' &&
        variable !== null &&
        Reflect.has(variable, property)
    );
}

export function isPromise<T = any>(variable: unknown): variable is Promise<T> {
    return isOfType<Promise<T>>(variable, 'then');
}
