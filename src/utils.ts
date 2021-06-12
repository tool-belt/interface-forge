export function isOfType<T>(
    variable: unknown,
    property: keyof T,
): variable is T {
    return !!variable && (variable as T)[property] !== undefined;
}
