import { BiometricsValidType } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import {
  getBiometryIconName,
  getAccessibiliyIdentificationInstructions
} from "../../utils";

describe("getBiometryIconName", () => {
  it("should return fingerprint accessibility label for BIOMETRICS", () => {
    const result = getBiometryIconName("BIOMETRICS" as BiometricsValidType);
    expect(result).toBe(
      I18n.t("identification.unlockCode.accessibility.fingerprint")
    );
  });

  it("should return faceId accessibility label for FACE_ID", () => {
    const result = getBiometryIconName("FACE_ID" as BiometricsValidType);
    expect(result).toBe(
      I18n.t("identification.unlockCode.accessibility.faceId")
    );
  });
});

describe("getAccessibiliyIdentificationInstructions", () => {
  it("should return unlock code instruction when biometric identification fails", () => {
    const result = getAccessibiliyIdentificationInstructions(undefined, true);
    expect(result).toBe(
      I18n.t("identification.instructions.useUnlockCodeA11y")
    );
  });

  it("should return fingerprint instruction for BIOMETRICS", () => {
    const result = getAccessibiliyIdentificationInstructions(
      "BIOMETRICS" as BiometricsValidType
    );
    expect(result).toBe(
      I18n.t("identification.instructions.useFingerPrintOrUnlockCodeA11y")
    );
  });

  it("should return faceId instruction for FACE_ID", () => {
    const result = getAccessibiliyIdentificationInstructions(
      "FACE_ID" as BiometricsValidType
    );
    expect(result).toBe(
      I18n.t("identification.instructions.useFaceIdOrUnlockCodeA11y")
    );
  });
});
