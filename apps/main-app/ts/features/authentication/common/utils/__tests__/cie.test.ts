import { Platform } from "react-native";

import {
  defaultUserAgent,
  iOSUserAgent,
  isAllowedUrl,
  WHITELISTED_DOMAINS
} from "../cie";

describe("isAllowedUrl", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(WHITELISTED_DOMAINS)(
    "should return true for the whitelisted domain %s",
    domain => {
      expect(isAllowedUrl(domain)).toBe(true);
    }
  );

  it.each(WHITELISTED_DOMAINS)(
    "should return true for the whitelisted domain %s with a path and query string",
    domain => {
      expect(isAllowedUrl(`${domain}/some/path?foo=bar`)).toBe(true);
    }
  );

  it("should return false for a non-whitelisted domain", () => {
    expect(isAllowedUrl("https://evil.com")).toBe(false);
  });

  it("should return false for a domain that merely contains a whitelisted domain as a suffix of its hostname", () => {
    expect(isAllowedUrl("https://evilidserver.servizicie.interno.gov.it")).toBe(
      false
    );
  });

  it("should return false for a domain that appends a whitelisted domain as a prefix of an unrelated hostname", () => {
    expect(
      isAllowedUrl("https://idserver.servizicie.interno.gov.it.evil.com")
    ).toBe(false);
  });

  it("should return false when the scheme doesn't match a whitelisted domain (http instead of https)", () => {
    expect(isAllowedUrl("http://idserver.servizicie.interno.gov.it")).toBe(
      false
    );
  });

  it("should return false for a malformed URL", () => {
    expect(isAllowedUrl("not-a-url")).toBe(false);
  });

  it("should return false for an empty string", () => {
    expect(isAllowedUrl("")).toBe(false);
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

describe("WHITELISTED_DOMAINS", () => {
  it("should only contain https origins", () => {
    WHITELISTED_DOMAINS.forEach(domain => {
      expect(domain.startsWith("https://")).toBe(true);
    });
  });

  it("should not contain duplicate entries", () => {
    expect(new Set(WHITELISTED_DOMAINS).size).toBe(WHITELISTED_DOMAINS.length);
  });
});
