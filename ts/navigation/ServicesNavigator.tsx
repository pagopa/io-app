import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { myPortalEnabled, svEnabled } from "../config";
import svNavigationConfig, {
  SvVoucherGenerationNavigator,
  SvVoucherListNavigator
} from "../features/bonus/siciliaVola/navigation/navigator";
import SV_ROUTES from "../features/bonus/siciliaVola/navigation/routes";
import ServiceDetailsScreen from "../screens/services/ServiceDetailsScreen";
import ServicesWebviewScreen from "../screens/services/ServicesWebviewScreen";
import ROUTES from "./routes";

const SvNavigator = createCompatNavigatorFactory(createStackNavigator)(
  svNavigationConfig,
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gestureEnabled: false
    }
  }
);

const Stack = createStackNavigator();

const ServicesNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.SERVICE_DETAIL}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: true }}
  >
    <Stack.Screen
      name={ROUTES.SERVICE_DETAIL}
      component={ServiceDetailsScreen}
    />
    {myPortalEnabled && (
      <Stack.Screen
        name={ROUTES.SERVICE_WEBVIEW}
        component={ServicesWebviewScreen}
      />
    )}
    {svEnabled && (
      <>
        <Stack.Screen
          name={SV_ROUTES.VOUCHER_GENERATION.MAIN}
          component={SvVoucherGenerationNavigator}
        />
        <Stack.Screen
          name={SV_ROUTES.VOUCHER_LIST.MAIN}
          component={SvVoucherListNavigator}
        />
      </>
    )}
  </Stack.Navigator>
);

export default ServicesNavigator;
