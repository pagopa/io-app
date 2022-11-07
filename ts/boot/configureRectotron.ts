import AsyncStorage from "@react-native-async-storage/async-storage";
import { Reactotron } from "reactotron-core-client";
import ReactotronReactNative from "reactotron-react-native";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ReactotronFlipper from "reactotron-react-native/dist/flipper";
import { reactotronRedux } from "reactotron-redux";
import sagaPlugin from "reactotron-redux-saga";

// add a regex to avoid tracing specific urls in Reactotron timeline
const ignoredUrls: RegExp | undefined = /symbolicate/;
export const configureReactotron = (): Reactotron => {
  const rtt = ReactotronReactNative.configure({
    createSocket: path => new ReactotronFlipper(path),
    host: "127.0.0.1"
  })
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
  // Let's clear Reactotron on every app loading
  if (rtt.clear) {
    rtt.clear();
  }

  return rtt;
};
