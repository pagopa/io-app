import { Platform } from "react-native";
import { isAuthenticationUrl } from "..";
import { getCieUatEndpoint } from "../endpoints";

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

describe(isAuthenticationUrl, () => {
  NOT_AUTH_URLS.forEach(url => {
    it(`Should be false -> ${url}`, () => {
      const isAuthUrl = isAuthenticationUrl(url);

      expect(isAuthUrl).toBe(false);
    });
  });
  AUTH_URLS.forEach(url => {
    it(`Should be true -> ${url}`, () => {
      const isAuthUrl = isAuthenticationUrl(url);

      expect(isAuthUrl).toBe(true);
    });
  });
});

describe("getCieUatEndpoint", () => {
  const baseUrl = "https://collaudo.idserver.servizicie.interno.gov.it/idp/";

  it("should return iOS URL when platform is ios", () => {
    jest
      .spyOn(Platform, "select")
      .mockImplementation((options: any) => options.ios);
    expect(getCieUatEndpoint()).toBe(`${baseUrl}Authn/SSL/Login2`);
  });

  it("should return Android URL when platform is android", () => {
    jest
      .spyOn(Platform, "select")
      .mockImplementation((options: any) => options.android);
    expect(getCieUatEndpoint()).toBe(baseUrl);
  });

  it("should return null for unknown platform", () => {
    jest
      .spyOn(Platform, "select")
      .mockImplementation((options: any) => options.default);
    expect(getCieUatEndpoint()).toBeNull();
  });
});
