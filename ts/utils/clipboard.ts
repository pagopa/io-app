import Clipboard from "@react-native-clipboard/clipboard";

import I18n from "../i18n";
import { IOToast } from "../components/Toast";

/**
 * Copy a text to the device clipboard and give a feedback.
 */
export const clipboardSetStringWithFeedback = (text: string) => {
  Clipboard.setString(text);

  IOToast.success(I18n.t("clipboard.copyFeedback"));
};
