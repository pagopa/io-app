import { useEffect, useRef } from "react";

/**
 * Hook used to store the _previous_ value
 * in a React functional component.
 */
export function usePrevious<T>(value: T) {
  const ref = useRef<T>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
