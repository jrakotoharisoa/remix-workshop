export const isNonUndefined = <T>(x: T | undefined): x is T => {
  return x !== undefined;
};
