import { BiometricsValidType } from "@pagopa/io-app-design-system";
import I18n from "../../i18n";

export const FAIL_ATTEMPTS_TO_SHOW_ALERT = 4;

export const getBiometryIconName = (
  biometryPrintableSimpleType: BiometricsValidType
) => {
  switch (biometryPrintableSimpleType) {
    case "BIOMETRICS":
    case "TOUCH_ID":
      return I18n.t("identification.unlockCode.accessibility.fingerprint");
    case "FACE_ID":
      return I18n.t("identification.unlockCode.accessibility.faceId");
  }
};

export const getBiometricInstructions = (
  biometricType: BiometricsValidType | undefined,
  isBimoetricIdentificatoinFailed: boolean = false
) => {
  if (isBimoetricIdentificatoinFailed) {
    return I18n.t("identification.subtitleCode");
  }

  switch (biometricType) {
    case "BIOMETRICS":
      return I18n.t("identification.subtitleCodeFingerprint");
    case "FACE_ID":
      return I18n.t("identification.subtitleCodeFaceId");
    case "TOUCH_ID":
      return I18n.t("identification.subtitleCodeFingerprint");
    default:
      return I18n.t("identification.subtitleCode");
  }
};
