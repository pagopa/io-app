import { Toast } from "native-base";
import Clipboard from "@react-native-community/clipboard";

import I18n from "../i18n";

/**
 * Copy a text to the device clipboard and give a feedback.
 */
export const clipboardSetStringWithFeedback = (text: string) => {
  clipboardSetStringWithoutFeedback(text);

  Toast.show({
    text: I18n.t("clipboard.copyFeedback")
  });
};

export const clipboardSetStringWithoutFeedback = (text: string) =>
  Clipboard.setString(text);
