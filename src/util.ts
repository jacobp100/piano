export enum Order {
  Before,
  After,
  Match
}

export const binarySearch = <T>(
  array: T[],
  fn: (value: T) => Order
): T | undefined => {
  let lower = 0;
  let upper = array.length - 1;

  while (lower <= upper) {
    const index = (lower + upper) >> 1; // div 2
    const element = array[index];
    const result = fn(element);
    switch (result) {
      case Order.Before:
        upper = index - 1;
        break;
      case Order.After:
        lower = index + 1;
        break;
      case Order.Match:
        return element;
      default:
        return undefined;
    }
  }

  return undefined;
};
