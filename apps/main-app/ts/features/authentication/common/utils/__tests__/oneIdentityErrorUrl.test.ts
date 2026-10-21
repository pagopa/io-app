import { isOneIdentityErrorUrl } from "..";

describe("isOneIdentityErrorUrl", () => {
  const scenarios = [
    {
      name: "a configuration error URL",
      url: "https://dev.oneid.pagopa.it/login/error?error_code=GENERIC_HTML_ERROR",
      expected: true
    },
    {
      name: "an error URL without a query",
      url: "https://dev.oneid.pagopa.it/login/error",
      expected: true
    },
    {
      name: "a relative error URL",
      url: "/login/error",
      expected: true
    },
    {
      name: "an HTTP error URL",
      url: "http://oneid.example.com/login/error",
      expected: true
    },
    {
      name: "a similar path containing the marker",
      url: "https://oneid.example.com/login/errors",
      expected: true
    },
    {
      name: "the error path inside a query",
      url: "https://oneid.example.com/authorize?next=/login/error",
      expected: false
    },
    {
      name: "the error path inside a fragment",
      url: "https://oneid.example.com/authorize#/login/error",
      expected: false
    },
    {
      name: "an ordinary URL",
      url: "https://oneid.example.com/authorize",
      expected: false
    },
    { name: "an empty input", url: "", expected: false }
  ];

  it.each(scenarios)("returns $expected for $name", ({ url, expected }) => {
    expect(isOneIdentityErrorUrl(url)).toBe(expected);
  });
});
