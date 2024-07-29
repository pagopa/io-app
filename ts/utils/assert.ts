export function assert(
  condition: unknown,
  msg: string = "Assertion failed"
): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
