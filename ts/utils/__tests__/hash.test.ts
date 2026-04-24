import { fnv1a } from "../hash";

describe("fnv1a", () => {
  describe("determinism", () => {
    it("should return the same value for the same input across multiple calls", () => {
      expect(fnv1a("hello")).toBe(fnv1a("hello"));
      expect(fnv1a("io-app")).toBe(fnv1a("io-app"));
    });
  });

  describe("known hash values", () => {
    const cases: ReadonlyArray<[string, number]> = [
      ["", 2166136261],
      ["a", 3826002220],
      ["hello", 1335831723],
      ["foobar", 3214735720],
      ["io-app", 3338450247],
      ["hello world", 3582672807]
    ];

    test.each(cases)('fnv1a("%s") === %i', (input, expected) => {
      expect(fnv1a(input)).toBe(expected);
    });
  });

  describe("output range", () => {
    const inputs = ["", "a", "hello", "foobar", "🔑", "a".repeat(1000)];

    test.each(inputs)('fnv1a("%s") is an unsigned 32-bit integer', input => {
      const result = fnv1a(input);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(4294967295);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe("collision resistance", () => {
    it("should produce different hashes for similar but distinct strings", () => {
      expect(fnv1a("hello")).not.toBe(fnv1a("Hello"));
      expect(fnv1a("abc")).not.toBe(fnv1a("bca"));
      expect(fnv1a("foo")).not.toBe(fnv1a("bar"));
    });
  });
});
