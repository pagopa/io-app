import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CoBadgeChooseType from "../screens/CoBadgeChooseType";
import SearchAvailableCoBadgeScreen from "../screens/search/SearchAvailableCoBadgeScreen";
import CoBadgeStartScreen from "../screens/start/CoBadgeStartScreen";
import { isGestureEnabled } from "../../../../../utils/navigation";
import WALLET_ONBOARDING_COBADGE_ROUTES from "./routes";
import { PaymentMethodOnboardingCoBadgeParamsList } from "./params";

const Stack = createStackNavigator<PaymentMethodOnboardingCoBadgeParamsList>();

const PaymentMethodOnboardingCoBadgeNavigator = () => (
  <Stack.Navigator
    initialRouteName={WALLET_ONBOARDING_COBADGE_ROUTES.MAIN}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={WALLET_ONBOARDING_COBADGE_ROUTES.CHOOSE_TYPE}
      component={CoBadgeChooseType}
    />
    <Stack.Screen
      name={WALLET_ONBOARDING_COBADGE_ROUTES.START}
      component={CoBadgeStartScreen}
    />
    <Stack.Screen
      name={WALLET_ONBOARDING_COBADGE_ROUTES.SEARCH_AVAILABLE}
      component={SearchAvailableCoBadgeScreen}
    />
  </Stack.Navigator>
);

export default PaymentMethodOnboardingCoBadgeNavigator;
