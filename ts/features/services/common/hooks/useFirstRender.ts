import { useRef } from "react";

/**
 * custom hook that returns true only on the first render
 */
export const useFirstRender = () => {
  const isFirstRender = useRef(true);

  if (isFirstRender.current) {
    // eslint-disable-next-line functional/immutable-data
    isFirstRender.current = false;

    return true;
  }

  return isFirstRender.current;
};
