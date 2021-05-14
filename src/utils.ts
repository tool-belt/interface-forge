export function isOfType<T>(
    variable: unknown,
    property: keyof T,
): variable is T {
    return (variable as T)[property] !== undefined;
}
