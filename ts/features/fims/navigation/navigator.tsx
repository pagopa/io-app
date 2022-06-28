import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { PathConfigMap } from "@react-navigation/native";
import FimsWebviewScreen from "../screens/FimsWebviewScreen";
import FIMS_ROUTES from "./routes";
import { FimsParamsList } from "./params";

export const fimsLinkingOptions: PathConfigMap = {
  [FIMS_ROUTES.MAIN]: {
    path: "fims",
    screens: {
      [FIMS_ROUTES.WEBVIEW]: "webview"
    }
  }
};

const Stack = createStackNavigator<FimsParamsList>();

export const FimsNavigator = () => (
  <Stack.Navigator
    initialRouteName={FIMS_ROUTES.MAIN}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: false }}
  >
    <Stack.Screen name={FIMS_ROUTES.WEBVIEW} component={FimsWebviewScreen} />
  </Stack.Navigator>
);
