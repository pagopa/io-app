import { type CredentialStatus } from "@pagopa/io-react-native-wallet";
import { isStale } from "../validity";

const makePayload = (
  overrides: Partial<CredentialStatus.StatusList> = {}
): CredentialStatus.StatusList => ({
  sub: "https://issuer.example/status/1",
  iat: 1000,
  status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" },
  ...overrides
});

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

describe("isStale", () => {
  describe("ttl (highest priority)", () => {
    it("returns false when within ttl of iat", () => {
      const payload = makePayload({ iat: 1000, ttl: 3600 });
      // (iat + ttl) * 1000 = (1000 + 3600) * 1000 = 4600000
      expect(isStale(payload, 4599999)).toBe(false);
    });

    it("returns true when ttl after iat has passed", () => {
      const payload = makePayload({ iat: 1000, ttl: 3600 });
      expect(isStale(payload, 4600001)).toBe(true);
    });

    it("uses ttl even when exp is also present", () => {
      // ttl expired (iat + ttl = 4600s), exp still valid (far future).
      const payload = makePayload({ iat: 1000, ttl: 3600, exp: 9999999999 });
      expect(isStale(payload, 4600001)).toBe(true);
    });
  });

  describe("exp (when ttl absent)", () => {
    it("returns false when exp has not passed", () => {
      const payload = makePayload({ exp: 5000 });
      // exp*1000 = 5000000
      expect(isStale(payload, 4000000)).toBe(false);
    });

    it("returns true when exp has passed", () => {
      const payload = makePayload({ exp: 5000 });
      expect(isStale(payload, 6000000)).toBe(true);
    });

    it("uses exp even when iat is also present", () => {
      const payload = makePayload({ exp: 5000, iat: 4999 });
      // exp expired, iat would still be within 24h. exp takes precedence.
      expect(isStale(payload, 6000000)).toBe(true);
    });
  });

  describe("iat fallback (when exp absent)", () => {
    it("returns false when within 24h of iat", () => {
      const payload = makePayload({ iat: 1000 });
      // iat*1000 + 24h = 1000000 + 86400000 = 87400000
      expect(isStale(payload, 1000000 + TWENTY_FOUR_HOURS_MS - 1)).toBe(false);
    });

    it("returns true when 24h after iat", () => {
      const payload = makePayload({ iat: 1000 });
      expect(isStale(payload, 1000000 + TWENTY_FOUR_HOURS_MS + 1)).toBe(true);
    });
  });
});
