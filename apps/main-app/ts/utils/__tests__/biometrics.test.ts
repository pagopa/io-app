import * as LocalAuthentication from "expo-local-authentication";

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
    input  | expected
    ${[1]} | ${"TOUCH_ID"}
    ${[2]} | ${"FACE_ID"}
    ${[3]} | ${"BIOMETRICS"}
  `("returns $expected when $input is given", async ({ input, expected }) => {
    const spy = jest.spyOn(
      LocalAuthentication,
      "supportedAuthenticationTypesAsync"
    );
    spy.mockResolvedValue(input);
    const result = await getBiometricsType();
    expect(result).toMatch(expected);
  });

  it("returns UNKNOWN for any undocumented resolved value", async () => {
    const spy = jest.spyOn(
      LocalAuthentication,
      "supportedAuthenticationTypesAsync"
    );
    spy.mockResolvedValue("literally anything, even 🤡" as any);
    const result = await getBiometricsType();
    expect(result).toMatch("UNKNOWN");
  });

  describe("when an error occurs", () => {
    const mixpanelSpy = jest.spyOn(mixpanel, "mixpanelTrack");

    it("returns UNAVAILABLE", async () => {
      const spy = jest.spyOn(
        LocalAuthentication,
        "supportedAuthenticationTypesAsync"
      );
      spy.mockRejectedValue("it exploded");
      const result = await getBiometricsType();
      expect(result).toMatch("UNAVAILABLE");
    });

    it("reports BIOMETRIC_ERROR to mixpanel with the relevant message when shouldTrackError is true (default)", async () => {
      const sensorSpy = jest.spyOn(
        LocalAuthentication,
        "supportedAuthenticationTypesAsync"
      );
      sensorSpy.mockRejectedValue(new Error("it exploded"));
      await getBiometricsType();
      expect(mixpanelSpy).toHaveBeenCalledWith("BIOMETRIC_ERROR", {
        error: "it exploded"
      });
    });

    it("does not report BIOMETRIC_ERROR to mixpanel when shouldTrackError is false", async () => {
      const sensorSpy = jest.spyOn(
        LocalAuthentication,
        "supportedAuthenticationTypesAsync"
      );
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
      const spyAuthenticate = jest.spyOn(
        LocalAuthentication,
        "authenticateAsync"
      );
      const spyOnSuccess = jest.fn();
      await biometricAuthenticationRequest(spyOnSuccess, jest.fn());
      expect(spyAuthenticate).toHaveBeenCalled();
      expect(spyOnSuccess).toHaveBeenCalledWith();
    });
  });

  describe("when authentication fails", () => {
    it("should call the error callback with the error message", async () => {
      const spyAuthenticate = jest.spyOn(
        LocalAuthentication,
        "authenticateAsync"
      );
      spyAuthenticate.mockRejectedValue("error");
      const spyOnError = jest.fn();
      await biometricAuthenticationRequest(jest.fn(), spyOnError);
      expect(spyAuthenticate).toHaveBeenCalled();
      expect(spyOnError).toHaveBeenCalledWith("error");
    });
  });
});

describe("mayUserActivateBiometric function", () => {
  it.each`
    input        | expected
    ${[1]}       | ${"ACTIVATED"}
    ${[3]}       | ${"ACTIVATED"}
    ${"Unknown"} | ${"ACTIVATED"}
  `("returns $expected when $input is given", async ({ input, expected }) => {
    const spy = jest.spyOn(
      LocalAuthentication,
      "supportedAuthenticationTypesAsync"
    );
    spy.mockResolvedValue(input);
    const result = await mayUserActivateBiometric();
    expect(result).toMatch(expected);
  });

  it("returns SENSOR_ERROR when getBiometricsType promise cannot be resolved", async () => {
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
    const spy = jest.spyOn(LocalAuthentication, "authenticateAsync");

    spy.mockResolvedValue(Promise.resolve({ success: true }));
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
    const spy = jest.spyOn(LocalAuthentication, "authenticateAsync");

    const error: LocalAuthentication.LocalAuthenticationError = "not_available";

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
    const spy = jest.spyOn(LocalAuthentication, "authenticateAsync");

    const errorsArray: Array<LocalAuthentication.LocalAuthenticationError> = [
      "not_enrolled",
      "user_cancel",
      "app_cancel",
      "not_available",
      "lockout",
      "no_space",
      "timeout",
      "unable_to_process",
      "unknown",
      "system_cancel",
      "user_fallback",
      "invalid_context",
      "passcode_not_set",
      "authentication_failed"
    ];

    for (const error of errorsArray) {
      spy.mockResolvedValue(Promise.resolve({ success: false, error }));
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
