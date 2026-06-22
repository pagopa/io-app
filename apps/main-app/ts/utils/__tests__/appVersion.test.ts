import { Tuple3 } from "@pagopa/ts-commons/lib/tuples";

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest
    .fn()
    .mockReturnValueOnce("1.1.3")
    .mockReturnValueOnce("1.1.9")
    .mockReturnValueOnce("1.2.3.4"),
  getVersion: jest
    .fn()
    .mockReturnValueOnce("1.1.3")
    .mockReturnValueOnce("1.1.9")
    .mockReturnValueOnce("1.2.3.4"),
  getBuildNumber: () => 3
}));
import { getAppVersion, isVersionSupported } from "../appVersion";

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
    Tuple3("0", "0", true),
    Tuple3("2", "2", true),
    Tuple3("2.2", "2.2", true),
    Tuple3("2.2.514", "2.2.514", true),
    Tuple3("2.2.514.123123", "2.2.514.123123", true),
    Tuple3("0.0.0", "1.2", true),
    Tuple3("1.1.0", "1.1.0", true),
    Tuple3("1.4", "1.5.57", true),
    Tuple3("1.4", "1.4.0.1", true),
    Tuple3("1.4.0.1", "1.4.0.a", true),
    Tuple3("1.4.1.1", "1.4.0.a", true),
    Tuple3("1.4.0.2", "1.4.0.3", true),
    Tuple3("1.4.0.2", "1.4.0.2", true),
    Tuple3("1.4.0.2", "1.4.0.1", false),
    Tuple3("1.4.5", "1.4.1", false),
    Tuple3("5", "1.4.1", false),
    Tuple3("3.0", "1.4.1", false),
    Tuple3("1.5.0", "1.4.1", false),
    Tuple3("2.0.0", "1.4.1", false),
    Tuple3("1.1.23", "1.1.21", false),
    Tuple3("1.1.2.23", "1.1.1", false),
    Tuple3("SOME STRANGE DATA", "1.4.1", true),
    Tuple3("1.0.0", "SOME STRANGE DATA", true),
    Tuple3("-9.0.1", "1.4.1", true),
    Tuple3("", "1.4.1", true),
    Tuple3(".", "1.4.1", true),
    Tuple3(".9", "1.4.1", true),
    Tuple3(".9.1.1.", "1.4.1", true),
    Tuple3("this is a string 9.1.1, really, a string", "1.4.1", true),
    Tuple3("9.1.", "1.4.1", true),
    Tuple3("9.1.1.1.", "1.4.1", true),
    Tuple3("9.1.1.1.1.1.1.1.1.1", "1.4.1", true),
    Tuple3("a.b", "1.4.1", true),
    Tuple3("9.b", "1.4.1", true),
    Tuple3("9.1.c", "1.4.1", true),
    Tuple3("😱", "1.4.1", true),
    Tuple3("😱.9", "1.4.1", true),
    Tuple3("旅館", "1.4.1", true),
    Tuple3("1.4.1", "-9.0.1", true),
    Tuple3("1.4.1", "", true),
    Tuple3("1.4.1", ".", true),
    Tuple3("1.4.1", ".9", true),
    Tuple3("1.4.1", ".9.1.1.", true),
    Tuple3("1.4.1", "this is a string 9.1.1, really, a string", true),
    Tuple3("1.4.1", "9.1.", true),
    Tuple3("1.4.1", "9.1.1.1.", true),
    Tuple3("1.4.1", "9.1.1.1.1.1.1.1.1.1", true),
    Tuple3("1.4.1", "a.b", true),
    Tuple3("1.4.1", "9.b", true),
    Tuple3("1.4.1", "9.1.c", true),
    Tuple3("1.4.1", "😱", true),
    Tuple3("1.4.1", "😱.9", true),
    Tuple3("1.4.1", "旅館", true)
  ].forEach(t => {
    it(`appversion ${t.e2} compared with minSupportedVersion ${
      t.e1
    } should be ${t.e3 ? "" : "not "}supported`, () => {
      expect(isVersionSupported(t.e1, t.e2)).toEqual(t.e3);
    });
  });
});
