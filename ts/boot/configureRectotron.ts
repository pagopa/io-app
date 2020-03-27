import AsyncStorage from "@react-native-community/async-storage";
import Reactotron from "reactotron-react-native";
import { reactotronRedux } from "reactotron-redux";
import sagaPlugin from "reactotron-redux-saga";

export const configureReactotron = () => {
  return Reactotron.setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from `react-native` or `@react-native-community/async-storage` depending on where you get it from
    .configure({ host: "127.0.0.1" }) // controls connection & communication settings
    .use(reactotronRedux())
    .use(sagaPlugin({ except: [] }))
    .useReactNative() // add all built-in react native plugins
    .connect(); // let's connect!
};
