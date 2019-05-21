import { AuthenticateConfig } from "react-native-touch-id";
import I18n from "../i18n";
import variables from "../theme/variables";

export const authenticateConfig: AuthenticateConfig = {
  title: I18n.t("identification.biometric.popup.title"),
  sensorDescription: I18n.t("identification.biometric.popup.sensorDescription"),
  cancelText: I18n.t("global.buttons.cancel"),
  fallbackLabel: I18n.t("identification.biometric.popup.fallbackLabel"),
  imageColor: variables.contentPrimaryBackground,
  imageErrorColor: variables.brandDanger,
  unifiedErrors: true
};
