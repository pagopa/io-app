import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import BPaySearchBankScreen from "../screens/search/BPaySearchBankScreen";
import BPaySearchStartScreen from "../screens/search/BPaySearchStartScreen";
import SearchAvailableUserBPayScreen from "../screens/searchBPay/SearchAvailableUserBPayScreen";
import { isGestureEnabled } from "../../../../../utils/navigation";
import WALLET_ONBOARDING_BPAY_ROUTES from "./routes";
import { PaymentMethodOnboardingBPayParamsList } from "./params";

const Stack = createStackNavigator<PaymentMethodOnboardingBPayParamsList>();

const PaymentMethodOnboardingBPayNavigator = () => (
  <Stack.Navigator
    initialRouteName={WALLET_ONBOARDING_BPAY_ROUTES.MAIN}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      name={WALLET_ONBOARDING_BPAY_ROUTES.START}
      component={BPaySearchStartScreen}
    />
    <Stack.Screen
      name={WALLET_ONBOARDING_BPAY_ROUTES.CHOOSE_BANK}
      component={BPaySearchBankScreen}
    />
    <Stack.Screen
      name={WALLET_ONBOARDING_BPAY_ROUTES.SEARCH_AVAILABLE_USER_ACCOUNT}
      component={SearchAvailableUserBPayScreen}
    />
  </Stack.Navigator>
);

export default PaymentMethodOnboardingBPayNavigator;
