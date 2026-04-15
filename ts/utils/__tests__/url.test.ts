import {
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "../navigation";
import {
  extractPathFromURL,
  getResourceNameFromUrl,
  getUrlBasepath
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

  it("should return the resource name without extension", () => {
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
});
