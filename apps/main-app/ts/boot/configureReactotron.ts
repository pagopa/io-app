import AsyncStorage from "@react-native-async-storage/async-storage";
import ReactotronReactNative from "reactotron-react-native";
import { reactotronRedux } from "reactotron-redux";

// add a regex to avoid tracing specific urls in Reactotron timeline
const ignoredUrls: RegExp | undefined = /symbolicate/;

export const configureReactotron = () => {
  const rtt = ReactotronReactNative
    // AsyncStorage handler should be set before anything else
    .setAsyncStorageHandler(AsyncStorage)
    .configure({
      name: "IO App"
    })
    .useReactNative({
      asyncStorage: true,
      networking: {
        ignoreUrls: ignoredUrls
      }
    })
    .use(reactotronRedux())
    .connect();

  // Let's clear Reactotron on every app loading
  if (rtt.clear) {
    rtt.clear();
  }

  return rtt;
};
