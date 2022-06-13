import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { PnMessageDetailsScreen } from "../screens/PnMessageDetailsScreen";
import { PnParamsList } from "./params";
import PN_ROUTES from "./routes";

const Stack = createStackNavigator<PnParamsList>();

export const PnStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={PN_ROUTES.MESSAGE_DETAILS}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: true }}
  >
    <Stack.Screen
      name={PN_ROUTES.MESSAGE_DETAILS}
      component={PnMessageDetailsScreen}
    />
  </Stack.Navigator>
);
