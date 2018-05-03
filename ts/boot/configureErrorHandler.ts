/**
 * Implements a custom generic error handler that keeps track of JavaScript exceptions
 *
 * TODO: Improve this using external libraries @https://www.pivotaltracker.com/story/show/155392873
 */

import { Alert } from "react-native";
import DeviceInfo from "react-native-device-info";
import Mixpanel from "react-native-mixpanel";

import I18n from "../i18n";
import {
  createSourceMapper,
  getStackTrace,
  ISourceMapsOptions,
  SourceMapper
} from "../react-native-source-maps";

const isDev = __DEV__;
const version = DeviceInfo.getReadableVersion();
const souceMapperOptions: ISourceMapsOptions = {
  sourceMapBundle: "main.jsbundle.map"
};

// Custom error handler for unhandled js exceptions
async function customErrorHandler(
  sourceMapper: SourceMapper,
  options: ISourceMapsOptions,
  error: Error,
  isFatal?: boolean
): Promise<void> {
  if (isFatal) {
    error.stack = await getStackTrace(sourceMapper, options, error);
    // Send a remote event that contains the error stack trace
    Mixpanel.trackWithProperties("APPLICATION_ERROR", {
      ERROR: JSON.stringify(error),
      ERROR_STACK_TRACE: JSON.stringify(error.stack),
      APP_VERSION: version
    });

    // Inform the user about the unfortunate event
    Alert.alert(
      I18n.t("global.jserror.title"),
      I18n.t("global.jserror.message")
    );
  }
}

export default async function configureErrorHandler(): Promise<void> {
  if (!isDev) {
    const sourceMapper = await createSourceMapper(souceMapperOptions);
    // Overrides the default error handler in BUNDLED MODE
    ErrorUtils.setGlobalHandler(async (error, isFatal?) => {
      await customErrorHandler(
        sourceMapper,
        souceMapperOptions,
        error,
        isFatal
      );
    });
  }
}
