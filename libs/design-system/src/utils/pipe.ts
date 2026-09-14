/**
 * Chains functions together, passing the result of each function as input to the next.
 * The first argument is the initial value, followed by any number of transformation functions.
 *
 * @example
 * ```typescript
 * const addOne = (x: number) => x + 1;
 * const double = (x: number) => x * 2;
 * const stringify = (x: number) => `Result: ${x}`;
 *
 * const result = pipe(
 *   10,
 *   addOne,    // 11
 *   double,    // 22
 *   stringify  // "Result: 22"
 * );
 * ```
 */
export function pipe<T>(value: T): T;
export function pipe<T, R1>(value: T, fn1: (arg: T) => R1): R1;
export function pipe<T, R1, R2>(
  value: T,
  fn1: (arg: T) => R1,
  fn2: (arg: R1) => R2
): R2;
export function pipe<T, R1, R2, R3>(
  value: T,
  fn1: (arg: T) => R1,
  fn2: (arg: R1) => R2,
  fn3: (arg: R2) => R3
): R3;
export function pipe<T, R1, R2, R3, R4>(
  value: T,
  fn1: (arg: T) => R1,
  fn2: (arg: R1) => R2,
  fn3: (arg: R2) => R3,
  fn4: (arg: R3) => R4
): R4;
export function pipe<T, R1, R2, R3, R4, R5>(
  value: T,
  fn1: (arg: T) => R1,
  fn2: (arg: R1) => R2,
  fn3: (arg: R2) => R3,
  fn4: (arg: R3) => R4,
  fn5: (arg: R4) => R5
): R5;
export function pipe(
  initialValue: any,
  ...transformers: Array<(arg: any) => any>
): any {
  return transformers.reduce(
    (currentValue, transformer) => transformer(currentValue),
    initialValue
  );
}
