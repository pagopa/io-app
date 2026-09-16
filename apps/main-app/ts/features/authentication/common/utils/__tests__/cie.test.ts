import { Platform } from "react-native";

import { defaultUserAgent, iOSUserAgent, isAllowedUrl } from "../cie";

const TEST_ALLOWED_ORIGINS = [
  "https://idserver.example.it",
  "https://oidc.idserver.example.it"
];

describe("isAllowedUrl", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(TEST_ALLOWED_ORIGINS)(
    "should return true for the allowed origin %s",
    origin => {
      expect(isAllowedUrl(origin, TEST_ALLOWED_ORIGINS)).toBe(true);
    }
  );

  it.each(TEST_ALLOWED_ORIGINS)(
    "should return true for the allowed origin %s with a path and query string",
    origin => {
      expect(
        isAllowedUrl(`${origin}/some/path?foo=bar`, TEST_ALLOWED_ORIGINS)
      ).toBe(true);
    }
  );

  it("should return false for a non-allowed origin", () => {
    expect(isAllowedUrl("https://evil.com", TEST_ALLOWED_ORIGINS)).toBe(false);
  });

  it("should return false for an origin that merely contains an allowed origin as a suffix of its hostname", () => {
    expect(
      isAllowedUrl("https://evilidserver.example.it", TEST_ALLOWED_ORIGINS)
    ).toBe(false);
  });

  it("should return false for an origin that appends an allowed origin as a prefix of an unrelated hostname", () => {
    expect(
      isAllowedUrl("https://idserver.example.it.evil.com", TEST_ALLOWED_ORIGINS)
    ).toBe(false);
  });

  it("should return false when the scheme doesn't match an allowed origin (http instead of https)", () => {
    expect(
      isAllowedUrl("http://idserver.example.it", TEST_ALLOWED_ORIGINS)
    ).toBe(false);
  });

  it("should return false for a malformed URL", () => {
    expect(isAllowedUrl("not-a-url", TEST_ALLOWED_ORIGINS)).toBe(false);
  });

  it("should return false for an empty string", () => {
    expect(isAllowedUrl("", TEST_ALLOWED_ORIGINS)).toBe(false);
  });

  it("should return false for any URL when allowedOrigins is empty", () => {
    expect(isAllowedUrl("https://idserver.example.it", [])).toBe(false);
  });
});

describe("defaultUserAgent", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it("should be the iOS user agent on iOS", () => {
    jest.resetModules();
    jest
      .spyOn(Platform, "select")
      .mockImplementation((spec: Record<string, unknown>) => spec.ios);

    const { defaultUserAgent: iosDefaultUserAgent } = require("../cie");

    expect(iosDefaultUserAgent).toBe(iOSUserAgent);
  });

  it("should be undefined on non-iOS platforms", () => {
    jest.resetModules();
    jest
      .spyOn(Platform, "select")
      .mockImplementation((spec: Record<string, unknown>) => spec.default);

    const { defaultUserAgent: androidDefaultUserAgent } = require("../cie");

    expect(androidDefaultUserAgent).toBeUndefined();
  });

  it("should match the platform-select result for the current test environment", () => {
    expect(defaultUserAgent).toBe(
      Platform.select({ ios: iOSUserAgent, default: undefined })
    );
  });
});

describe("originSchemasWhiteList", () => {
  afterEach(() => {
    jest.resetModules();
  });

  it("should always include the https and iologin schemas", () => {
    const { originSchemasWhiteList } = require("../cie");

    expect(originSchemasWhiteList).toEqual(
      expect.arrayContaining(["https://*", "iologin://*"])
    );
  });

  it("should also include the http schema when running in a dev environment", () => {
    jest.doMock("../../../../../utils/environment", () => ({ isDevEnv: true }));

    const { originSchemasWhiteList } = require("../cie");

    expect(originSchemasWhiteList).toEqual(
      expect.arrayContaining(["https://*", "iologin://*", "http://*"])
    );
  });

  it("should not include the http schema when not running in a dev environment", () => {
    jest.doMock("../../../../../utils/environment", () => ({
      isDevEnv: false
    }));

    const { originSchemasWhiteList } = require("../cie");

    expect(originSchemasWhiteList).not.toEqual(
      expect.arrayContaining(["http://*"])
    );
  });
});
