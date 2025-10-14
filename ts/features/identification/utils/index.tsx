import { BiometricsValidType, Body } from "@pagopa/io-app-design-system";
import { BackHandler, Platform, View } from "react-native";
import { TxtParagraphNode } from "@textlint/ast-node-types";
import I18n from "i18next";
import IOMarkdown from "../../../components/IOMarkdown";
import { Renderer } from "../../../components/IOMarkdown/types";
import { getTxtNodeKey } from "../../../components/IOMarkdown/renderRules";
import { IdentificationBackActionType } from "../store/reducers";

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

export const getAccessibiliyIdentificationInstructions = (
  biometricType: BiometricsValidType | undefined,
  isBimoetricIdentificatoinFailed: boolean = false
) => {
  if (isBimoetricIdentificatoinFailed) {
    return I18n.t("identification.instructions.useUnlockCodeA11y");
  }

  switch (biometricType) {
    case "BIOMETRICS":
    case "TOUCH_ID":
      return I18n.t(
        "identification.instructions.useFingerPrintOrUnlockCodeA11y"
      );
    case "FACE_ID":
      return I18n.t("identification.instructions.useFaceIdOrUnlockCodeA11y");
    default:
      return I18n.t("identification.instructions.useUnlockCodeA11y");
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

  const generatePragraphRule = () => ({
    Paragraph(paragraph: TxtParagraphNode, render: Renderer) {
      return (
        <Body
          key={getTxtNodeKey(paragraph)}
          color="white"
          style={{ textAlign: "center" }}
        >
          {paragraph.children.map(render)}
        </Body>
      );
    }
  });

  const instructionComponent = (
    <View
      accessible
      accessibilityLabel={I18n.t(
        "identification.instructions.useUnlockCodeA11y"
      )}
      style={{ flexDirection: "row" }}
    >
      <IOMarkdown
        content={I18n.t("identification.instructions.useUnlockCode")}
        rules={generatePragraphRule()}
      />
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
          style={{ flexDirection: "row" }}
        >
          <IOMarkdown
            content={I18n.t(
              "identification.instructions.useFingerPrintOrUnlockCode"
            )}
            rules={generatePragraphRule()}
          />
        </View>
      );
    case "FACE_ID":
      return (
        <View
          accessible
          accessibilityLabel={a11yInstruction}
          style={{ flexDirection: "row" }}
        >
          <IOMarkdown
            content={I18n.t(
              "identification.instructions.useFaceIdOrUnlockCode"
            )}
            rules={generatePragraphRule()}
          />
        </View>
      );
    default:
      return instructionComponent;
  }
};

export const handleAndroidBackNavigation = (
  identificationContext: IdentificationBackActionType | undefined,
  defaultCloseAction: () => void
) => {
  if (Platform.OS === "android") {
    switch (identificationContext) {
      case IdentificationBackActionType.CLOSE_APP:
        // In CLOSE_APP context, the back button should close the app
        BackHandler.exitApp();
        break;
      case IdentificationBackActionType.DEFAULT:
      default:
        // In DEFAULT context, the back button should do the normal behavior
        defaultCloseAction();
        break;
    }
  }
};
