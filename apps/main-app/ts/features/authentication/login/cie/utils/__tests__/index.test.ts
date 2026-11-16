import { Platform } from "react-native";

import { isAuthenticationUrl } from "..";

type PlatformSpec = { android?: unknown; default?: unknown; ios?: unknown };

const setPlatform = (platform: "android" | "ios") =>
  jest
    .spyOn(Platform, "select")
    .mockImplementation((spec: PlatformSpec) =>
      platform in spec ? spec[platform] : spec.default
    );

describe("isAuthenticationUrl", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const PLATFORMS = ["android", "ios"] as const;

  const NOT_AUTH_URLS = [
    "http://localhost/livello2mobile?id=1",
    "http://localhost/livello?id=1",
    "http://localhost/livello2mobile",
    "http://localhost/livello3mobile?id=1",
    "http://localhost/livello4"
  ];
  const AUTH_URLS = [
    "http://localhost/livello1?id=1",
    "http://localhost/livello2",
    "http://localhost/nextUrl?id=1",
    "http://localhost/OpenApp/test"
  ];
  const LIVELLO3_URLS = [
    "http://localhost/livello3",
    "http://localhost/livello3?id=1",
    "http://localhost/livello3/test"
  ];

  describe.each(PLATFORMS)("on %s", platform => {
    beforeEach(() => {
      setPlatform(platform);
    });

    it.each(NOT_AUTH_URLS)("should be false -> %s", url => {
      expect(isAuthenticationUrl(url)).toBe(false);
    });

    it.each(AUTH_URLS)("should be true -> %s", url => {
      expect(isAuthenticationUrl(url)).toBe(true);
    });
  });

  it.each(LIVELLO3_URLS)("should be true on ios -> %s", url => {
    setPlatform("ios");
    expect(isAuthenticationUrl(url)).toBe(true);
  });

  // Non regression: forwarding `livello3` to the Android CieID app makes it
  // close immediately, the page must load in the WebView and reach `OpenApp`
  it.each(LIVELLO3_URLS)("should be false on android -> %s", url => {
    setPlatform("android");
    expect(isAuthenticationUrl(url)).toBe(false);
  });
});
