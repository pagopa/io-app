import { Tuple3 } from "italia-ts-commons/lib/tuples";

const appVersionMock = jest
  .fn()
  .mockReturnValueOnce("1.1.3")
  .mockReturnValueOnce("1.1.9")
  .mockReturnValueOnce("1.2.3.4");
jest.mock("react-native-device-info", () => {
  return {
    getReadableVersion: appVersionMock,
    getAppVersion: appVersionMock,
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
  [
    Tuple3("0.0.0", "1.2", true),
    Tuple3("1.1.0", "1.1.0", true),
    Tuple3("1.4", "1.5.57", true),
    Tuple3("1.4", "1.4.0.1", true),
    Tuple3("1.4.0.1", "1.4.0.a", true), // should compare 1.4.0 with 1.4.0
    Tuple3("1.4.1.1", "1.4.0.a", false), // should compare 1.4.1 with 1.4.0
    Tuple3("1.4.0.2", "1.4.0.3", true),
    Tuple3("1.4.0.2", "1.4.0.2", true),
    Tuple3("1.4.0.2", "1.4.0.1", false),
    Tuple3("1.4.5", "1.4.1", false),
    Tuple3("5", "1.4.1", false),
    Tuple3("3.0", "1.4.1", false),
    Tuple3("1.1.23", "1.1.21", false),
    Tuple3("1.1.2.23", "1.1.1", false),
    Tuple3("SOME STRANGE DATA", "1.4.1", true)
  ].forEach(t => {
    it(`appversion ${t.e2} compared with minSupportedVersion ${
      t.e1
    } should be ${t.e3 ? "" : "not "}supported`, () => {
      expect(isVersionAppSupported(t.e1, t.e2)).toEqual(t.e3);
    });
  });
});
