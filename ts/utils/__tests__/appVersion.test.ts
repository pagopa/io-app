jest.mock("react-native-device-info", () => {
  return {
    getVersion: jest
      .fn()
      .mockReturnValueOnce("1.1")
      .mockReturnValueOnce("1.1.9")
      .mockReturnValueOnce("1.2.3.4"),
    getBuildNumber: () => 3
  };
});
import { getAppVersion, isVersionAppSupported } from "../appVersion";

describe("check if getVersion works properly", () => {
  it("should be 1.1.3", () => {
    expect(getAppVersion()).toEqual("1.1.3");
  });

  it("should be 1.1.9", () => {
    expect(getAppVersion()).toEqual("1.1.9");
  });

  it("should be 1.2.3.4", () => {
    expect(getAppVersion()).toEqual("1.2.3.4");
  });
});

describe("check if app version is supported by backend version", () => {
  it("supported", () => {
    expect(isVersionAppSupported("0.0.0", "1.2")).toEqual(true);
  });

  it("supported", () => {
    expect(isVersionAppSupported("1.1.0", "1.1.0")).toEqual(true);
  });

  it("supported", () => {
    expect(isVersionAppSupported("1.4", "1.5.57")).toEqual(true);
  });

  it("supported", () => {
    expect(isVersionAppSupported("1.4", "1.4.0.1")).toEqual(true);
  });

  it("supported", () => {
    expect(isVersionAppSupported("1.4.0.2", "1.4.0.3")).toEqual(true);
  });

  it("not supported", () => {
    expect(isVersionAppSupported("1.4.5", "1.4.1")).toEqual(false);
  });

  it("not supported", () => {
    expect(isVersionAppSupported("5", "1.4.1")).toEqual(false);
  });

  it("not supported", () => {
    expect(isVersionAppSupported("3.0", "1.4.1")).toEqual(false);
  });

  it("not supported", () => {
    expect(isVersionAppSupported("1.1.23", "1.1.21")).toEqual(false);
  });

  it("not supported", () => {
    expect(isVersionAppSupported("1.1.2.23", "1.1.1")).toEqual(false);
  });

  it("not supported", () => {
    expect(isVersionAppSupported("SOME STRANGE DATA", "1.4.1")).toEqual(true);
  });
});
