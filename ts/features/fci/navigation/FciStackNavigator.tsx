import * as React from "react";
import { PathConfigMap } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import FciRouterScreen from "../screens/FciRouterScreen";
import { FCI_ROUTES } from "./routes";
import { FciParamsList } from "./params";

const Stack = createStackNavigator<FciParamsList>();

export const fciLinkingOptions: PathConfigMap = {
  [FCI_ROUTES.MAIN]: {
    path: "fci",
    screens: {
      [FCI_ROUTES.SIGNATURE]: "main"
    }
  }
};

export const FciStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={FCI_ROUTES.SIGNATURE}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen name={FCI_ROUTES.SIGNATURE} component={FciRouterScreen} />
  </Stack.Navigator>
);
