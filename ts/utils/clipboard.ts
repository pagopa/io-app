import { Toast } from "native-base";
import { Clipboard } from "react-native";

import I18n from "../i18n";

/**
 * Copy a text to the device clipboard and optionally give a feedback.
 */
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

/**
 * Copy a text to the device clipboard and give a feedback.
 */
export const copyToClipboardWithFeedback = (text: string) => {
  copyToClipboard(text, true);
};
