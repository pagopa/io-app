import FingerprintScanner, { Errors } from "react-native-fingerprint-scanner";

import * as mixpanel from "../../mixpanel";
import {
  biometricAuthenticationRequest,
  getBiometricsType,
  isBiometricsValidType,
  mayUserActivateBiometric
} from "../biometrics";
import * as Biometric from "../biometrics";

afterEach(() => {
  jest.clearAllMocks();
});

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
    const mixpanelSpy = jest.spyOn(mixpanel, "mixpanelTrack");

    it("returns UNAVAILABLE", async () => {
      const spy = jest.spyOn(FingerprintScanner, "isSensorAvailable");
      spy.mockRejectedValue("it exploded");
      const result = await getBiometricsType();
      expect(result).toMatch("UNAVAILABLE");
    });

    it("reports BIOMETRIC_ERROR to mixpanel with the relevant message when shouldTrackError is true (default)", async () => {
      const sensorSpy = jest.spyOn(FingerprintScanner, "isSensorAvailable");
      sensorSpy.mockRejectedValue(new Error("it exploded"));
      await getBiometricsType();
      expect(mixpanelSpy).toHaveBeenCalledWith("BIOMETRIC_ERROR", {
        error: "it exploded"
      });
    });

    it("does not report BIOMETRIC_ERROR to mixpanel when shouldTrackError is false", async () => {
      const sensorSpy = jest.spyOn(FingerprintScanner, "isSensorAvailable");
      sensorSpy.mockRejectedValue(new Error("it exploded"));
      await getBiometricsType(false);
      expect(mixpanelSpy).not.toHaveBeenCalled();
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

describe("mayUserActivateBiometric function", () => {
  it.each`
    input           | expected
    ${"Touch ID"}   | ${"ACTIVATED"}
    ${"Biometrics"} | ${"ACTIVATED"}
    ${"Unknown"}    | ${"ACTIVATED"}
  `("returns $expected when $input is given", async ({ input, expected }) => {
    const spy = jest.spyOn(FingerprintScanner, "isSensorAvailable");
    spy.mockResolvedValue(input);
    const result = await mayUserActivateBiometric();
    expect(result).toMatch(expected);
  });

  it("returns SENSOR_ERROR when getBiometricsType promise cannot be resolved ", async () => {
    const getBiometricsTypeRejectedMock = Promise.reject();

    try {
      await Biometric.biometricFunctionForTests.mayUserActivateBiometricWithDependency(
        getBiometricsTypeRejectedMock
      );
    } catch (error) {
      expect(error).toBe("SENSOR_ERROR");
    }
  });

  it("returns ACTIVATED when getBiometricsType promise resolves FACE_ID and the authentication is successful", async () => {
    const getBiometricsTypeFaceIDMock = Promise.resolve(
      "FACE_ID" as Biometric.BiometricsType
    );
    const spy = jest.spyOn(FingerprintScanner, "authenticate");

    spy.mockResolvedValue(Promise.resolve());
    const result =
      await Biometric.biometricFunctionForTests.mayUserActivateBiometricWithDependency(
        getBiometricsTypeFaceIDMock
      );

    expect(result).toMatch("ACTIVATED");
  });

  it("returns PERMISSION_DENIED when getBiometricsType promise resolves FACE_ID and the user refuses permission to use the biometric", async () => {
    const getBiometricsTypeFaceIDMock = Promise.resolve(
      "FACE_ID" as Biometric.BiometricsType
    );
    const spy = jest.spyOn(FingerprintScanner, "authenticate");

    const error: Errors = {
      name: "FingerprintScannerNotAvailable",
      message:
        "\tAuthentication could not start because Fingerprint Scanner is not available on the device"
    };

    spy.mockResolvedValue(Promise.reject(error));
    try {
      await Biometric.biometricFunctionForTests.mayUserActivateBiometricWithDependency(
        getBiometricsTypeFaceIDMock
      );
    } catch (error) {
      expect(error).toBe("PERMISSION_DENIED");
    }
  });

  it("returns AUTH_FAILED when getBiometricsType promise resolves FACE_ID and the authentication fails", async () => {
    const getBiometricsTypeFaceIDMock = Promise.resolve(
      "FACE_ID" as Biometric.BiometricsType
    );
    const spy = jest.spyOn(FingerprintScanner, "authenticate");

    const errorsArray: Array<Errors> = [
      {
        name: "AuthenticationFailed",
        message:
          "Authentication was not successful because the user failed to provide valid credentials"
      },
      { name: "AuthenticationNotMatch", message: "No match" },
      {
        name: "AuthenticationProcessFailed",
        message: "Sensor was unable to process the image. Please try again."
      },
      {
        name: "AuthenticationTimeout",
        message:
          "Authentication was not successful because the operation timed out."
      },
      {
        name: "DeviceLocked",
        message:
          "Authentication was not successful, the device currently in a lockout of 30 seconds"
      },
      {
        name: "DeviceLockedPermanent",
        message:
          "Authentication was not successful, device must be unlocked via password."
      },
      {
        name: "DeviceOutOfMemory",
        message:
          "Authentication could not proceed because there is not enough free memory on the device."
      },
      {
        name: "FingerprintScannerNotEnrolled",
        message:
          "\tAuthentication could not start because Fingerprint Scanner has no enrolled fingers"
      },
      {
        name: "FingerprintScannerNotSupported",
        message: "Device does not support Fingerprint Scanner"
      },
      {
        name: "FingerprintScannerUnknownError",
        message: "Could not authenticate for an unknown reason"
      },
      { name: "HardwareError", message: "A hardware error occurred." },
      {
        name: "PasscodeNotSet",
        message:
          "Authentication could not start because the passcode is not set on the device"
      },
      {
        name: "SystemCancel",
        message:
          "Authentication was canceled by system - e.g. if another application came to foreground while the authentication dialog was up"
      },
      {
        name: "UserCancel",
        message:
          "Authentication was canceled by the user - e.g. the user tapped Cancel in the dialog"
      },
      {
        name: "UserFallback",
        message:
          "Authentication was canceled because the user tapped the fallback button (Enter Password)"
      }
    ];

    for (const error of errorsArray) {
      spy.mockResolvedValue(Promise.reject(error));
      try {
        await Biometric.biometricFunctionForTests.mayUserActivateBiometricWithDependency(
          getBiometricsTypeFaceIDMock
        );
      } catch (error) {
        expect(error).toBe("AUTH_FAILED");
      }
    }
  });
});
