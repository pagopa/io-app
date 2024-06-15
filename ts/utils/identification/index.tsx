import {
  BiometricsValidType,
  Body,
  IOStyles
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
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

const getTranlations = () => {
  // We need a function to handle the translations when the language changes,
  // or is differnt between the device and the app
  const unlockCode = I18n.t("identification.instructions.unlockCode");
  const unlockCodePrefix = I18n.t(
    "identification.instructions.unlockCodepPrefix"
  );
  const fingerprint = I18n.t("identification.instructions.fingerprint");
  const fingerprintPrefix = I18n.t(
    "identification.instructions.fingerprintPrefix"
  );
  const faceId = I18n.t("identification.instructions.faceId");
  const faceIdPrefix = I18n.t("identification.instructions.faceIdPrefix");
  return {
    unlockCode,
    unlockCodePrefix,
    fingerprint,
    fingerprintPrefix,
    faceId,
    faceIdPrefix,
    congiunction: I18n.t("identification.instructions.congiunction"),
    unlockCodeInstruction: `${unlockCodePrefix} ${unlockCode}`,
    fingerprintInstruction: `${fingerprintPrefix} ${fingerprint}`,
    faceIdInstruction: `${faceIdPrefix} ${faceId}`
  };
};

export const getAccessibiliyIdentificationInstructions = (
  biometricType: BiometricsValidType | undefined,
  isBimoetricIdentificatoinFailed: boolean = false
) => {
  const {
    unlockCodeInstruction,
    fingerprintInstruction,
    faceIdInstruction,
    congiunction
  } = getTranlations();

  if (isBimoetricIdentificatoinFailed) {
    return unlockCodeInstruction;
  }

  switch (biometricType) {
    case "BIOMETRICS":
    case "TOUCH_ID":
      return `${fingerprintInstruction} ${congiunction} ${unlockCodeInstruction}`;
    case "FACE_ID":
      return `${faceIdInstruction} ${congiunction} ${unlockCodeInstruction}`;
    default:
      return unlockCodeInstruction;
  }
};

export const IdentificationInstructionsComponent = (props: {
  biometricType: BiometricsValidType | undefined;
  isBimoetricIdentificatoinFailed: boolean;
}) => {
  const { biometricType, isBimoetricIdentificatoinFailed } = props;
  const a11yInstruction = getAccessibiliyIdentificationInstructions(
    biometricType,
    isBimoetricIdentificatoinFailed
  );
  const {
    unlockCode,
    unlockCodePrefix,
    fingerprint,
    fingerprintPrefix,
    faceId,
    faceIdPrefix,
    congiunction
  } = getTranlations();
  const instructionComponent = (
    <View style={IOStyles.row}>
      <Body color="white" weight="Regular">
        {unlockCodePrefix}
        <Body color="white" weight="Bold">
          {` ${unlockCode}`}
        </Body>
      </Body>
    </View>
  );
  const instructionComponentWithFingerprint = (
    <View style={IOStyles.row}>
      <Body color="white" weight="Regular">
        {fingerprintPrefix}
        <Body color="white" weight="Bold">{` ${fingerprint}`}</Body>
      </Body>
    </View>
  );
  const instructionComponentWithFaceId = (
    <View style={IOStyles.row}>
      <Body color="white" weight="Regular">
        {faceIdPrefix}
        <Body color="white" weight="Bold">{` ${faceId}`}</Body>
      </Body>
    </View>
  );

  if (isBimoetricIdentificatoinFailed) {
    return instructionComponent;
  }

  switch (biometricType) {
    case "BIOMETRICS":
    case "TOUCH_ID":
      return (
        <View
          accessible
          accessibilityLabel={a11yInstruction}
          style={IOStyles.row}
        >
          {instructionComponentWithFingerprint}
          <Body color="white" weight="Regular">
            {" "}
            {congiunction}{" "}
          </Body>
          {instructionComponent}
        </View>
      );
    case "FACE_ID":
      return (
        <View
          accessible
          accessibilityLabel={a11yInstruction}
          style={IOStyles.row}
        >
          {instructionComponentWithFaceId}
          <Body color="white" weight="Regular">
            {" "}
            {congiunction}{" "}
          </Body>
          {instructionComponent}
        </View>
      );
    default:
      return instructionComponent;
  }
};
