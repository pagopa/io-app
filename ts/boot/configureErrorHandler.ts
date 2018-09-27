/**
 * Implements a custom generic error handler that keeps track of JavaScript exceptions
 *
 * TODO: Improve this using external libraries @https://www.pivotaltracker.com/story/show/155392873
 */

import Instabug from "instabug-reactnative";
import { Alert } from "react-native";

import I18n from "../i18n";

const isDev = __DEV__;

// Custom error handler for unhandled js exceptions
function customErrorHandler(error: Error, isFatal?: boolean) {
  if (isFatal) {
    Instabug.reportJSException(error);

    // Inform the user about the unfortunate event
    Alert.alert(
      I18n.t("global.jserror.title"),
      I18n.t("global.jserror.message")
    );
  }
}

export default function configureErrorHandler() {
  if (!isDev) {
    // Overrides the default error handler in BUNDLED MODE
    ErrorUtils.setGlobalHandler(customErrorHandler);
  }
}
