import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { PathConfigMap } from "@react-navigation/native";
import FimsWebviewScreen from "../screens/FimsWebviewScreen";
import { AppParamsList } from "../../../navigation/params/AppParamsList";
import FIMS_LEGACY_ROUTES from "./routes";
import { FimsLegacyParamsList } from "./params";

export const fimsLegacyLinkingOptions: PathConfigMap<AppParamsList> = {
  [FIMS_LEGACY_ROUTES.MAIN]: {
    path: "fims",
    screens: {
      [FIMS_LEGACY_ROUTES.WEBVIEW]: "webview"
    }
  }
};

const Stack = createStackNavigator<FimsLegacyParamsList>();

export const FimsLegacyNavigator = () => (
  <Stack.Navigator
    initialRouteName={FIMS_LEGACY_ROUTES.MAIN}
    screenOptions={{ gestureEnabled: false, headerShown: false }}
  >
    <Stack.Screen
      name={FIMS_LEGACY_ROUTES.WEBVIEW}
      component={FimsWebviewScreen}
    />
  </Stack.Navigator>
);
