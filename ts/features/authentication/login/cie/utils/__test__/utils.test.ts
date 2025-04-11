import { isAuthenticationUrl } from "..";

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
