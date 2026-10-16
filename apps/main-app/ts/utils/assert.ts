export function assert(
  condition: unknown,
  msg = "Assertion failed"
): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
