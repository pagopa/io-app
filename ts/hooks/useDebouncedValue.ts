import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a value.
 *
 * @template Value - The type of the value to debounce.
 * @param {Object} params - The parameters for the hook.
 * @param {Value} params.initial - The initial value.
 * @param {Value} params.value - The value to debounce.
 * @param {number} params.delay - The debounce delay in milliseconds.
 * @returns {Value} - The debounced value.
 */

export function useDebouncedValue<Value>({
  delay,
  initial,
  value
}: {
  initial: Value;
  value: Value;
  delay: number;
}) {
  const [debouncedValue, setDebouncedValue] = useState<Value>(initial);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay, value]);

  return debouncedValue;
}
