import { NativeModules } from "react-native";

import {
  createInspector,
  metroHostFromSourceUrl,
  metroSourceUrlFromNativeModules
} from "../createInspector";

describe("createInspector helpers", () => {
  it("does not create an inspector in test environments", () => {
    expect(createInspector()).toBeUndefined();
  });
  it("reads Metro URL from SourceCode constants", () => {
    const getConstants = jest
      .spyOn(NativeModules.SourceCode, "getConstants")
      .mockReturnValue({
        scriptURL: "http://localhost:8081/index.bundle"
      });

    expect(metroHostFromSourceUrl(metroSourceUrlFromNativeModules())).toBe(
      "localhost"
    );

    getConstants.mockRestore();
  });

  it("accepts only HTTP(S) Metro URLs", () => {
    expect(metroHostFromSourceUrl("http://localhost:8081/index.bundle")).toBe(
      "localhost"
    );
    expect(
      metroHostFromSourceUrl("http://192.168.1.10:8081/index.bundle")
    ).toBe("192.168.1.10");
    expect(metroHostFromSourceUrl("http://[::1]:8081/index.bundle")).toBe(
      "[::1]"
    );
    expect(
      metroHostFromSourceUrl("ws://secret.example/index.bundle")
    ).toBeUndefined();
    expect(metroHostFromSourceUrl("file:///index.bundle")).toBeUndefined();
    expect(metroHostFromSourceUrl(undefined)).toBeUndefined();
    expect(metroHostFromSourceUrl("not a URL")).toBeUndefined();
  });
});
