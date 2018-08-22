/**
 * Main app entrypoint
 */

import { AppRegistry } from "react-native";
import Config from "react-native-config";
import {
  setJSExceptionHandler,
  setNativeExceptionHandler
} from "react-native-exception-handler";
import DeviceInfo from "react-native-device-info";
import Mixpanel from "react-native-mixpanel";

// Configure Mixpanel session
Mixpanel.sharedInstanceWithToken(Config.MIXPANEL_TOKEN);

const errorHandler = (e, isFatal) => {
  if (isFatal) {
    Mixpanel.trackWithProperties("APPLICATION_ERROR", {
      TYPE: "js",
      ERROR: JSON.stringify(e),
      APP_VERSION: DeviceInfo.getReadableVersion()
    });
    Alert.alert(
      "Unexpected error occurred",
      `
        Error: ${isFatal ? "Fatal:" : ""} ${e.name} ${e.message}
        You will need to restart the app.
        `
    );
  } else {
    console.log(e); // So that we can see it in the ADB logs in case of Android if needed
  }
};

setJSExceptionHandler(errorHandler);
setNativeExceptionHandler(exceptionString => {
  Mixpanel.trackWithProperties("APPLICATION_ERROR", {
    TYPE: "native",
    ERROR: exceptionString,
    APP_VERSION: DeviceInfo.getReadableVersion()
  });
});

import { App } from "./ts/App";

// Temporary workaround for @https://github.com/facebook/react-native/issues/18868
// TODO: Remove this as soon as it has been fixed @https://www.pivotaltracker.com/story/show/158144437
import { YellowBox } from "react-native";
YellowBox.ignoreWarnings(["Warning: isMounted(...) is deprecated"]);

AppRegistry.registerComponent("ItaliaApp", () => App);
