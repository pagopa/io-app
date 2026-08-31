import { randomInt } from "fp-ts/lib/Random";
/**
 * generate a n chars pseudo-random string (n value is 26 as default)
 */
export const getRandomStringId = (chars = 26): string => {
  const randomSlice = () => Math.random().toString(36).substring(2, 15);
  return (randomSlice() + randomSlice() + randomSlice())
    .substring(0, chars)
    .toUpperCase();
};

/**
 * generate a random int included in range [min,max]
 */
export const getRandomIntInRange = (min: number, max: number) =>
  randomInt(min, max)().valueOf();
