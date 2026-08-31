import { IOToast } from "@io-app/design-system";
import * as Clipboard from "expo-clipboard";
import I18n from "i18next";

/**
 * Copy a text to the device clipboard and give a feedback.
 */
export const clipboardSetStringWithFeedback = (text: string) => {
  void Clipboard.setStringAsync(text);

  IOToast.success(I18n.t("clipboard.copyFeedback"));
};
