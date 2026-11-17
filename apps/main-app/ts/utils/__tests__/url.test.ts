import {
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "../navigation";
import {
  extractPathFromURL,
  getResourceNameFromUrl,
  getUrlBasepath,
  safeUrlParse
} from "../url";

describe("getResourceNameFromUrl", () => {
  const remoteHost = "https://somedomain.com/somepath/";
  const extension = ".pdf";
  const resource = "somefile";
  const remoteResource = remoteHost + resource + extension;
  it("should return the resource name without extension", () => {
    expect(getResourceNameFromUrl(remoteResource)).toEqual(resource);
  });

  it("should return the resource name with extension too", () => {
    expect(getResourceNameFromUrl(remoteResource, true)).toEqual(
      resource + extension
    );
  });

  it("should return the resource name without extension for a local file url", () => {
    const localHost = "file://somefolder/somefolder2/";
    const localResource = localHost + resource + extension;
    expect(getResourceNameFromUrl(localResource)).toEqual(resource);
  });

  it("should return the given input", () => {
    const notAPath = "not a path";
    expect(getResourceNameFromUrl(notAPath)).toEqual(notAPath);
  });
});

describe("getUrlBasepath", () => {
  it("should return the same url", () => {
    const url = "https://www.google.com/it/hello";
    expect(getUrlBasepath(url)).toEqual(url);
  });

  it("should return the same url even with params and fragments", () => {
    const base = "https://www.google.com/it/hello";
    const suffixesToRemove: ReadonlyArray<string> = [
      "?param1=1&param2=2",
      "?param1=1&param2=2&params3",
      "#fragment=1",
      "?param1=1#fragment=1",
      "?param1=1&param2=2#fragment=1",
      "#fragment=1?param1=1&param2=2"
    ];
    suffixesToRemove.forEach(s => {
      expect(getUrlBasepath(base + s)).toEqual(base);
    });
    const suffixesToNotRemove: ReadonlyArray<string> = [
      "&param1=1?param2=2",
      "&param1=1?param2=2#fragment=3",
      "%3Fparam1%3D1%26param2%3D2%23fragment%3D1",
      "%3Fparam1%3D1%26param2%3D2"
    ];
    suffixesToNotRemove.forEach(s => {
      expect(getUrlBasepath(base + s)).toEqual(base + s);
    });
  });
});

describe("extractPathFromURL", () => {
  it("should return undefined", () => {
    const url = "https://www.google.com/it/hello";
    expect(
      extractPathFromURL(
        [IO_INTERNAL_LINK_PREFIX, IO_UNIVERSAL_LINK_PREFIX],
        url
      )
    ).toBeUndefined();
  });

  it("should return the path", () => {
    const url = "https://continua.io.pagopa.it/idpay/auth/12345678";
    const path = "/idpay/auth/12345678";
    expect(
      extractPathFromURL(
        [IO_INTERNAL_LINK_PREFIX, IO_UNIVERSAL_LINK_PREFIX],
        url
      )
    ).toEqual(path);
  });

  it("should return the path with query parameters", () => {
    const url = "https://continua.io.pagopa.it/initiative/main?itemId=12345678";
    const path = "/initiative/main?itemId=12345678";
    expect(
      extractPathFromURL(
        [IO_INTERNAL_LINK_PREFIX, IO_UNIVERSAL_LINK_PREFIX],
        url
      )
    ).toEqual(path);
  });

  it.each([
    [
      "collapses repeated slashes in the path and keeps the query",
      "https://continua.io.pagopa.it//itw//auth?a=1",
      "/itw/auth?a=1"
    ],
    [
      "collapses repeated slashes in the origin and path of an internal link",
      "ioit:///services//service-detail?serviceId=1",
      "services/service-detail?serviceId=1"
    ],
    [
      "preserves double slashes inside the query string",
      "https://continua.io.pagopa.it/itw/auth?client_id=openid_federation:https://example.org/rp&request_uri=https://example.org/req&state=abc",
      "/itw/auth?client_id=openid_federation:https://example.org/rp&request_uri=https://example.org/req&state=abc"
    ],
    [
      "keeps every '?' of a nested URL in the query",
      "https://continua.io.pagopa.it/itw/auth?request_uri=https://rp/req?id=1&state=a",
      "/itw/auth?request_uri=https://rp/req?id=1&state=a"
    ]
  ])("%s", (_, url, expected) => {
    expect(
      extractPathFromURL(
        [IO_INTERNAL_LINK_PREFIX, IO_UNIVERSAL_LINK_PREFIX],
        url
      )
    ).toEqual(expected);
  });
});

describe("safeUrlParse", () => {
  it("returns the parsed URL with the query string as an object", () => {
    const result = safeUrlParse("https://example.com/path?a=1&b=2");

    expect(
      result.match(
        ({ host, pathname, query }) => ({ host, pathname, query }),
        error => error
      )
    ).toEqual({
      host: "example.com",
      pathname: "/path",
      query: { a: "1", b: "2" }
    });
  });

  it("returns an Err with the cause instead of throwing", () => {
    const url = {
      toString: () => {
        throw new Error("Invalid URL");
      }
    } as unknown as string;

    const result = safeUrlParse(url);

    expect(
      result.match(
        () => "",
        error => error
      )
    ).toContain("Invalid URL");
  });
});
