import FingerprintScanner from "react-native-fingerprint-scanner";

import * as mixpanel from "../../mixpanel";
import {
  biometricAuthenticationRequest,
  getBiometricsType,
  isBiometricsValidType
} from "../biometrics";

describe("getBiometricsType function", () => {
  it.each`
    input           | expected
    ${"Touch ID"}   | ${"TOUCH_ID"}
    ${"Face ID"}    | ${"FACE_ID"}
    ${"Biometrics"} | ${"BIOMETRICS"}
  `("returns $expected when $input is given", async ({ input, expected }) => {
    const spy = jest.spyOn(FingerprintScanner, "isSensorAvailable");
    spy.mockResolvedValue(input);
    const result = await getBiometricsType();
    expect(result).toMatch(expected);
  });

  it("returns UNKNOWN for any undocumented resolved value", async () => {
    const spy = jest.spyOn(FingerprintScanner, "isSensorAvailable");
    spy.mockResolvedValue("literally anything, even 🤡" as any);
    const result = await getBiometricsType();
    expect(result).toMatch("UNKNOWN");
  });

  describe("when an error occurs", () => {
    it("returns UNAVAILABLE", async () => {
      const spy = jest.spyOn(FingerprintScanner, "isSensorAvailable");
      spy.mockRejectedValue("it exploded");
      const result = await getBiometricsType();
      expect(result).toMatch("UNAVAILABLE");
    });

    it("reports BIOMETRIC_ERROR to mixpanel with the relevant message", async () => {
      const sensorSpy = jest.spyOn(FingerprintScanner, "isSensorAvailable");
      sensorSpy.mockRejectedValue(new Error("it exploded"));
      const mixpanelSpy = jest.spyOn(mixpanel, "mixpanelTrack");
      await getBiometricsType();
      expect(mixpanelSpy).toHaveBeenCalledWith("BIOMETRIC_ERROR", {
        error: "it exploded"
      });
    });
  });
});

describe("isBiometricsValidType function", () => {
  it.each`
    input            | expected
    ${"UNAVAILABLE"} | ${false}
    ${"UNKNOWN"}     | ${false}
    ${"BIOMETRICS"}  | ${true}
    ${"FACE_ID"}     | ${true}
    ${"TOUCH_ID"}    | ${true}
  `("returns $expected when $input is given", ({ input, expected }) => {
    expect(isBiometricsValidType(input)).toBe(expected);
  });
});

describe("biometricAuthenticationRequest function", () => {
  describe("when authentication succeeds", () => {
    it("should call the success callback", async () => {
      const spyAuthenticate = jest.spyOn(FingerprintScanner, "authenticate");
      const spyRelease = jest.spyOn(FingerprintScanner, "release");
      const spyOnSuccess = jest.fn();
      await biometricAuthenticationRequest(spyOnSuccess, jest.fn());
      expect(spyAuthenticate).toHaveBeenCalled();
      expect(spyOnSuccess).toHaveBeenCalledWith();
      expect(spyRelease).toHaveBeenCalled();
    });
  });

  describe("when authentication fails", () => {
    it("should call the error callback with the error message", async () => {
      const spyAuthenticate = jest.spyOn(FingerprintScanner, "authenticate");
      spyAuthenticate.mockRejectedValue("error");
      const spyRelease = jest.spyOn(FingerprintScanner, "release");
      const spyOnError = jest.fn();
      await biometricAuthenticationRequest(jest.fn(), spyOnError);
      expect(spyAuthenticate).toHaveBeenCalled();
      expect(spyOnError).toHaveBeenCalledWith("error");
      expect(spyRelease).toHaveBeenCalled();
    });
  });
});
