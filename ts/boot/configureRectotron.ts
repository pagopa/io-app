import { NativeModules } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Reactotron from "reactotron-react-native";
import { reactotronRedux } from "reactotron-redux";
import { isDevEnv } from "../utils/environment";

// add a regex to avoid tracing specific urls in Reactotron timeline
const ignoredUrls: RegExp | undefined = /symbolicate/;

// Automatically gets the machine's IP address to configure Reactotron
const getScriptHostname = () => {
  if (isDevEnv) {
    const scriptURL = NativeModules.SourceCode.scriptURL;
    return scriptURL?.split("://")[1].split(":")[0];
  }
  return undefined;
};

export const configureReactotron = () => {
  const rtt = Reactotron.configure({
    name: "IO App",
    host: getScriptHostname()
  })
    .useReactNative({
      networking: {
        ignoreUrls: ignoredUrls
      }
    })
    .use(reactotronRedux())
    .setAsyncStorageHandler(AsyncStorage)
    .connect();

  // Let's clear Reactotron on every app loading
  if (rtt.clear) {
    rtt.clear();
  }

  return rtt;
};
