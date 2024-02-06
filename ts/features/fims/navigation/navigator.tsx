import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { PathConfigMap } from "@react-navigation/native";
import FimsWebviewScreen from "../screens/FimsWebviewScreen";
import { AppParamsList } from "../../../navigation/params/AppParamsList";
import FIMS_ROUTES from "./routes";
import { FimsParamsList } from "./params";

export const fimsLinkingOptions: PathConfigMap<AppParamsList> = {
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
    screenOptions={{ gestureEnabled: false, headerShown: false }}
  >
    <Stack.Screen name={FIMS_ROUTES.WEBVIEW} component={FimsWebviewScreen} />
  </Stack.Navigator>
);
