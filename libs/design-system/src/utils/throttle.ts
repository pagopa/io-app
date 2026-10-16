export const throttle = <T extends Array<unknown>>(
  fn: (...args: T) => void,
  ms: number
) => {
  // eslint-disable-next-line functional/no-let
  let lastCall = 0;
  return (...args: T) => {
    const now = Date.now();

    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  };
};
