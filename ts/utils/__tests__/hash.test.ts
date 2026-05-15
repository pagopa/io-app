import { fnv1a } from "../hash";

describe("fnv1a", () => {
  describe("determinism", () => {
    it("should return the same value for the same input across multiple calls", () => {
      expect(fnv1a("hello")).toBe(fnv1a("hello"));
      expect(fnv1a("io-app")).toBe(fnv1a("io-app"));
    });

    it("should return the same value for the same input and seed across multiple calls", () => {
      expect(fnv1a("hello", 42)).toBe(fnv1a("hello", 42));
      expect(fnv1a("io-app", 999)).toBe(fnv1a("io-app", 999));
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

  describe("seed parameter", () => {
    it("seed=0 (default) should produce the same result as omitting the seed", () => {
      expect(fnv1a("hello", 0)).toBe(fnv1a("hello"));
      expect(fnv1a("io-app", 0)).toBe(fnv1a("io-app"));
    });

    it("different seeds should produce different hashes for the same input", () => {
      expect(fnv1a("hello", 1)).not.toBe(fnv1a("hello", 2));
      expect(fnv1a("hello", 0)).not.toBe(fnv1a("hello", 42));
    });

    it("same seed should produce different hashes for different inputs", () => {
      expect(fnv1a("hello", 42)).not.toBe(fnv1a("world", 42));
    });

    it("seeded hash should remain in unsigned 32-bit integer range", () => {
      const result = fnv1a("hello", 12345);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(4294967295);
      expect(Number.isInteger(result)).toBe(true);
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
