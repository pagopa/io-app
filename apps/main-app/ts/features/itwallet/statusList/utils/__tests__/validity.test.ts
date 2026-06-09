import { isStale } from "../validity";
import { type StoredStatusList } from "../schemas";

const makeEntry = (
  overrides: Partial<StoredStatusList["payload"]> = {},
  resolvedAt = 1000000
): StoredStatusList => ({
  payload: {
    sub: "https://issuer.example/status/1",
    status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" },
    ...overrides
  },
  meta: { resolvedAt }
});

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

describe("isStale", () => {
  describe("ttl precedence (highest priority)", () => {
    it("returns false when ttl has not elapsed", () => {
      const entry = makeEntry({ ttl: 3600 }, 1000000);
      // resolvedAt (1000000) + ttl*1000 (3600000) = 4600000
      expect(isStale(entry, 4000000)).toBe(false);
    });

    it("returns true when ttl has elapsed", () => {
      const entry = makeEntry({ ttl: 3600 }, 1000000);
      expect(isStale(entry, 5000000)).toBe(true);
    });

    it("uses ttl even when exp is also present", () => {
      const entry = makeEntry({ ttl: 3600, exp: 9999999999 }, 1000000);
      // ttl expired, but exp is far in the future. ttl should take precedence.
      expect(isStale(entry, 5000000)).toBe(true);
    });
  });

  describe("exp fallback (when ttl absent)", () => {
    it("returns false when exp has not passed", () => {
      const entry = makeEntry({ exp: 5000 });
      // exp*1000 = 5000000
      expect(isStale(entry, 4000000)).toBe(false);
    });

    it("returns true when exp has passed", () => {
      const entry = makeEntry({ exp: 5000 });
      expect(isStale(entry, 6000000)).toBe(true);
    });
  });

  describe("iat fallback (when ttl and exp absent)", () => {
    it("returns false when within 24h of iat", () => {
      const entry = makeEntry({ iat: 1000 });
      // iat*1000 + 24h = 1000000 + 86400000 = 87400000
      expect(isStale(entry, 1000000 + TWENTY_FOUR_HOURS_MS - 1)).toBe(false);
    });

    it("returns true when 24h after iat", () => {
      const entry = makeEntry({ iat: 1000 });
      expect(isStale(entry, 1000000 + TWENTY_FOUR_HOURS_MS + 1)).toBe(true);
    });
  });

  describe("no validity fields (always stale)", () => {
    it("returns true when no ttl, exp, or iat", () => {
      const entry = makeEntry({});
      expect(isStale(entry, 0)).toBe(true);
    });
  });
});
