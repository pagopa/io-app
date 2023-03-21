import { ImageURISource, Platform } from "react-native";
import { toAndroidCacheTimestamp } from "../dates";
import { addCacheTimestampToUri } from "../image";

describe("addCacheTimestampToUri", () => {
  describe("on ios", () => {
    beforeAll(() => {
      jest.resetModules();
      jest.mock("react-native/Libraries/Utilities/Platform", () => ({
        OS: "ios", // or 'ios'
        select: () => null
      }));
    });

    it("should set Platform.OS to iOS", () => {
      expect(Platform.OS).toBe("ios");
    });

    it("shouldn't add ts param to the provided URI", () => {
      const testUri = { uri: "test" };
      const res = addCacheTimestampToUri(testUri);
      expect(res).toBe(testUri);
    });
  });

  describe("on Android", () => {
    beforeAll(() => {
      jest.resetModules();
      jest.mock("react-native/Libraries/Utilities/Platform", () => ({
        OS: "android", // or 'ios'
        select: () => null
      }));
    });

    it("should set Platform.OS to Android", () => {
      expect(Platform.OS).toBe("android");
    });

    it("should add ts param to the provided URI", () => {
      const testUri = { uri: "test" };
      const res = addCacheTimestampToUri(testUri);
      expect(res.uri).toBe(`${testUri.uri}?ts=${toAndroidCacheTimestamp()}`);
    });

    it("shouldn't edit the object if no uri is provided", () => {
      const testUri = { bundle: "test" };
      const res = addCacheTimestampToUri(testUri);
      expect(res).toBe(testUri);
    });

    it("shouldn't edit the uri if an undefined uri is provided", () => {
      const testUri = { bundle: "test", uri: undefined };
      const res = addCacheTimestampToUri(testUri);
      expect(res).toBe(testUri);
    });

    it("should return undefined if undefined is provided", () => {
      const testUri = undefined as unknown as ImageURISource;
      const res = addCacheTimestampToUri(testUri);
      expect(testUri).toBe(res);
    });

    it("should return null if null is provided", () => {
      const testUri = null as unknown as ImageURISource;
      const res = addCacheTimestampToUri(testUri);
      expect(testUri).toBe(res);
    });
  });
});
