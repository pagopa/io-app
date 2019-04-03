import { getResourceNameFromUrl } from "../url";

describe("getResourceNameFromUrl", () => {
  let remoteHost = "https://somedomain.com/somepath/";
  let extension = ".pdf";
  let resource = "somefile";

  it("should return the resource name without extension", () => {
    var remoteResource = remoteHost + resource + extension;
    expect(getResourceNameFromUrl(remoteResource)).toEqual(resource);
  });

  it("should return the resource name with extension too", () => {
    var remoteResource = remoteHost + resource + extension;
    expect(getResourceNameFromUrl(remoteResource, true)).toEqual(
      resource + extension
    );
  });

  it("should return the resource name without extension", () => {
    var localHost = "file://somefolder/somefolder2/";
    var remoteResource = localHost + resource + extension;
    expect(getResourceNameFromUrl(remoteResource)).toEqual(resource);
  });

  it("should return the given input", () => {
    var notAPath = "not a path";
    expect(getResourceNameFromUrl(notAPath)).toEqual(notAPath);
  });
});
