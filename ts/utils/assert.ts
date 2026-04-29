const DEFAULT_ASSERTION_MESSAGE = "Assertion failed";

export function assert(
  condition: unknown,
  msg: string = DEFAULT_ASSERTION_MESSAGE
): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
