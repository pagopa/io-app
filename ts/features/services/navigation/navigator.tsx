import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import { isNewServicesEnabled, myPortalEnabled } from "../../../config";
import { ServiceDetailsScreen } from "../screens/ServiceDetailsScreen";
import ServicesWebviewScreen from "../../../screens/services/ServicesWebviewScreen";
import LegacyServiceDetailsScreen from "../../../screens/services/LegacyServiceDetailsScreen";
import { ServicesParamsList } from "./params";
import { SERVICES_ROUTES } from "./routes";

const Stack = createStackNavigator<ServicesParamsList>();

const ServicesNavigator = () => (
  <Stack.Navigator
    initialRouteName={SERVICES_ROUTES.SERVICE_DETAIL}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      name={SERVICES_ROUTES.SERVICE_DETAIL}
      component={
        isNewServicesEnabled ? ServiceDetailsScreen : LegacyServiceDetailsScreen
      }
      options={{
        headerShown: isNewServicesEnabled
      }}
    />
    {myPortalEnabled && (
      <Stack.Screen
        name={SERVICES_ROUTES.SERVICE_WEBVIEW}
        component={ServicesWebviewScreen}
      />
    )}
  </Stack.Navigator>
);

export default ServicesNavigator;
