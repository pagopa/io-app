import { getResourceNameFromUrl } from "../url";

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
