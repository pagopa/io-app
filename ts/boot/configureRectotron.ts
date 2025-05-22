import { NativeModules } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// using require import instead of static import due to library issue
// https://github.com/infinitered/reactotron/issues/1430#issuecomment-2180872830
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ReactotronReactNative = require("reactotron-react-native").default;
// import ReactotronReactNative from "reactotron-react-native";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { reactotronRedux } = require("reactotron-redux");

// add a regex to avoid tracing specific urls in Reactotron timeline
const ignoredUrls: RegExp | undefined = /symbolicate/;

export const configureReactotron = () => {
  // Automatically gets the machine's IP address to configure Reactotron
  const scriptURL = NativeModules.SourceCode.scriptURL;
  const host = scriptURL?.split("://")[1].split(":")[0];

  const rtt = ReactotronReactNative.configure({
    name: "IO App",
    host
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
