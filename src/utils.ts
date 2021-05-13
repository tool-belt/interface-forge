export const isOfType = <T>(
    variable: unknown,
    propertyToCheckFor: keyof T,
): variable is T => (variable as T)[propertyToCheckFor] !== undefined;
