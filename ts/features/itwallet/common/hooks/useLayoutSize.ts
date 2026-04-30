import { useCallback, useState } from "react";
import { LayoutRectangle } from "react-native";

type LayoutSize = Pick<LayoutRectangle, "width" | "height">;

/**
 * Custom hook to manage layout size state, providing a setter that only updates
 * the state when the new size differs from the current size to prevent unnecessary
 * re-renders.
 */
export const useLayoutSize = (
  initialSize: LayoutSize = { width: 0, height: 0 }
) => {
  const [size, setSize] = useState<LayoutSize>(initialSize);

  const updateSize = useCallback((n: LayoutSize) => {
    setSize(p => (p.width === n.width && p.height === n.height ? p : n));
  }, []);

  return [size, updateSize] as const;
};
