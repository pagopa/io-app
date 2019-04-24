import { Toast } from "native-base";
import { Clipboard } from "react-native";

import I18n from "../i18n";

export const copyToClipboard = (
  text: string,
  withFeedback: boolean = false
) => {
  Clipboard.setString(text);
  if (withFeedback) {
    Toast.show({
      text: I18n.t("clipboard.copyFeedback")
    });
  }
};

export const copyToClipboardWithFeedback = (text: string) => {
  copyToClipboard(text, true);
};
