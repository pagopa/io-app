import AsyncStorage from "@react-native-community/async-storage";
import { Reactotron } from "reactotron-core-client";
import ReactotronReactNative from "reactotron-react-native";
import { reactotronRedux } from "reactotron-redux";
import sagaPlugin from "reactotron-redux-saga";

// add a regex to avoid tracing specific urls in Reactotron timeline
// use this regex to avoid tracing scheduled pollings
// ignoredUrls = /backend.json|info/
const ignoredUrls: RegExp | undefined = undefined;
export const configureReactotron = (): Reactotron => {
  const rtt = ReactotronReactNative.configure({ host: "192.168.1.77" })
    .useReactNative({
      networking: {
        ignoreUrls: ignoredUrls
      }
    })
    .use(reactotronRedux())
    .use(sagaPlugin({ except: [] }))
    .connect();
  if (rtt.setAsyncStorageHandler) {
    rtt.setAsyncStorageHandler(AsyncStorage);
  }
  // Let's clear Reactotron on every time we load the app
  if (rtt.clear) {
    rtt.clear();
  }

  return rtt;
};
