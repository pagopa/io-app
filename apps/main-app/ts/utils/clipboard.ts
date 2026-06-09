import Clipboard from "@react-native-clipboard/clipboard";
import { IOToast } from "@pagopa/io-app-design-system";

import I18n from "i18next";

/**
 * Copy a text to the device clipboard and give a feedback.
 */
export const clipboardSetStringWithFeedback = (text: string) => {
  Clipboard.setString(text);

  IOToast.success(I18n.t("clipboard.copyFeedback"));
};
