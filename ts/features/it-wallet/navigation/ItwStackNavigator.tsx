import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import ItwActivationInfoAuthScreen from "../screens/issuing/ItwActivationInfoAuthScreen";
import PidPreviewScreen from "../screens/issuing/PidPreviewScreen";
import { ItwParamsList } from "./params";
import { ITW_ROUTES } from "./routes";

const Stack = createStackNavigator<ItwParamsList>();

export const ItwStackNavigator = () => (
  <Stack.Navigator
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={ITW_ROUTES.ACTIVATION.DETAILS}
      component={PidPreviewScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ACTIVATION.INFO}
      component={ItwActivationInfoAuthScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ACTIVATION.PID_PREVIEW}
      component={PidPreviewScreen}
    />
  </Stack.Navigator>
);
