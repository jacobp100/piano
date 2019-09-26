export enum Order {
  Before = -1,
  After = 1,
  Match = 0
}

export const orderedArraySearch = <T>(
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
      case -1:
        upper = index - 1;
        break;
      case 1:
        lower = index + 1;
        break;
      case 0:
        return element;
      default:
        return undefined;
    }
  }

  return undefined;
};
