import { useEffect, useRef } from "react";

/**
 * Runs the callback only on the first render.
 * If `shouldRun` is provided and returns false, doesn't run the callback.
 *
 * @param callback
 * @param shouldRun additional condition
 */
export const useOnFirstRender = (
  callback: () => void,
  shouldRun: () => boolean = () => true
) => {
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current && shouldRun()) {
      // eslint-disable-next-line functional/immutable-data
      firstUpdate.current = false;
      callback();
    }
  }, [callback, shouldRun]);
  return null;
};
