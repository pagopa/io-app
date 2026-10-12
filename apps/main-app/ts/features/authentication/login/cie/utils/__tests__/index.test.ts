import { getCieIdEnvironment, isAuthenticationUrl } from "..";

describe("isAuthenticationUrl", () => {
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
    "http://localhost/livello3",
    "http://localhost/livello3?id=1",
    "http://localhost/livello3/test",
    "http://localhost/nextUrl?id=1",
    "http://localhost/OpenApp/test"
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
