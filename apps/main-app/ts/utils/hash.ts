/**
 * FNV-1a 32-bit constants.
 * @see http://www.isthe.com/chongo/tech/comp/fnv/
 */
const FNV1A_OFFSET_BASIS_32 = 2166136261;
const FNV1A_PRIME_32 = 16777619;

/**
 * Computes the FNV-1a 32-bit hash of a string.
 *
 * Produces a deterministic unsigned 32-bit integer from any string input.
 * Useful for generating stable numeric identifiers from string seeds
 * (e.g. consistent color assignments, bucket selection).
 *
 * NOT suitable for cryptographic or security-sensitive purposes.
 *
 * @param input - The string to hash.
 * @param seed - Optional seed to vary the hash output. Same input + same seed always returns the same value. Defaults to 0.
 * @returns An unsigned 32-bit integer in the range [0, 4294967295].
 */
export const fnv1a = (input: string, seed: number = 0): number => {
  // XOR the offset basis with the seed to produce a unique starting state per seed.
  // eslint-disable-next-line no-bitwise
  const offsetBasis = (FNV1A_OFFSET_BASIS_32 ^ seed) >>> 0;
  // Iterate over UTF-16 code units, consistent with charCodeAt semantics.
  const hash = Array.from({ length: input.length }, (_, i) =>
    input.charCodeAt(i)
  ).reduce(
    (acc, charCode) =>
      // eslint-disable-next-line no-bitwise
      Math.imul(acc ^ charCode, FNV1A_PRIME_32),
    offsetBasis
  );
  // eslint-disable-next-line no-bitwise
  return hash >>> 0;
};
