import { getCieIdEnvironment, isAuthenticationUrl } from "..";

describe("isAuthenticationUrl", () => {
  const NOT_AUTH_URLS = [
    "http://localhost/livello2mobile?id=1",
    "http://localhost/livello?id=1",
    "http://localhost/livello2mobile"
  ];
  const AUTH_URLS = [
    "http://localhost/livello1?id=1",
    "http://localhost/livello2",
    "http://localhost/nextUrl?id=1",
    "http://localhost/openApp/test"
  ];

  it.each(NOT_AUTH_URLS)("should be false -> %s", url => {
    const isAuthUrl = isAuthenticationUrl(url);
    expect(isAuthUrl).toBe(false);
  });

  it.each(AUTH_URLS)("should be true -> %s", url => {
    const isAuthUrl = isAuthenticationUrl(url);
    expect(isAuthUrl).toBe(true);
  });
});

describe("getCieIdEnvironment", () => {
  it("should target the preprod CieID app when UAT is enabled", () => {
    expect(getCieIdEnvironment(true)).toEqual("preprod");
  });

  it("should target the production CieID app when UAT is disabled", () => {
    expect(getCieIdEnvironment(false)).toEqual("production");
  });
});
