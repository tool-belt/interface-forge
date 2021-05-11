export const isOfType = <T>(
  variable: any,
  propertyToCheckFor: keyof T,
): variable is T => (variable as T)[propertyToCheckFor] !== undefined;
