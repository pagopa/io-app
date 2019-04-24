import { Toast } from "native-base";
import { Clipboard } from "react-native";

import I18n from "../i18n";

/**
 * Copy a text to the device clipboard and give a feedback.
 */
export const clipboardSetStringWithFeedback = (text: string) => {
  Clipboard.setString(text);
  Toast.show({
    text: I18n.t("clipboard.copyFeedback")
  });
};
