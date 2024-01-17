import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import BpdDetailsScreen from "../screens/details/BpdDetailsScreen";
import BpdTransactionsRouterScreen from "../screens/details/transaction/v2/BpdTransactionsRouterScreen";
import CtaLandingScreen from "../screens/onboarding/BpdCTAStartOnboardingScreen";
import BpdInformationScreen from "../screens/onboarding/BpdInformationScreen";
import DeclarationScreen from "../screens/onboarding/declaration/DeclarationScreen";
import EnrollPaymentMethodsScreen from "../screens/onboarding/EnrollPaymentMethodsScreen";
import ErrorPaymentMethodsScreen from "../screens/onboarding/ErrorPaymentMethodsScreen";
import LoadActivateBpdScreen from "../screens/onboarding/LoadActivateBpdScreen";
import LoadBpdActivationStatus from "../screens/onboarding/LoadBpdActivationStatus";
import NoPaymentMethodsAvailableScreen from "../screens/onboarding/NoPaymentMethodsAvailableScreen";
import OptInPaymentMethodsCashbackUpdateScreen from "../screens/optInPaymentMethods/OptInPaymentMethodsCashbackUpdateScreen";
import OptInPaymentMethodsChoiceScreen from "../screens/optInPaymentMethods/OptInPaymentMethodsChoiceScreen";
import OptInPaymentMethodsThankYouDeleteMethodsScreen from "../screens/optInPaymentMethods/OptInPaymentMethodsThankYouDeleteMethodsScreen";
import OptInPaymentMethodsThankYouKeepMethodsScreen from "../screens/optInPaymentMethods/OptInPaymentMethodsThankYouKeepMethodsScreen";
import { isGestureEnabled } from "../../../../utils/navigation";
import BPD_ROUTES from "./routes";
import {
  BpdDetailsParamsList,
  BpdOnboardingParamsList,
  BpdOptInParamsList
} from "./params";

const BpdOnboardingStack = createStackNavigator<BpdOnboardingParamsList>();

export const BpdOnboardingNavigator = () => (
  <BpdOnboardingStack.Navigator
    initialRouteName={BPD_ROUTES.ONBOARDING.LOAD_CHECK_ACTIVATION_STATUS}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <BpdOnboardingStack.Screen
      name={BPD_ROUTES.ONBOARDING.LOAD_CHECK_ACTIVATION_STATUS}
      component={LoadBpdActivationStatus}
    />
    <BpdOnboardingStack.Screen
      name={BPD_ROUTES.ONBOARDING.INFORMATION_TOS}
      component={BpdInformationScreen}
    />
    <BpdOnboardingStack.Screen
      name={BPD_ROUTES.ONBOARDING.DECLARATION}
      component={DeclarationScreen}
    />
    <BpdOnboardingStack.Screen
      name={BPD_ROUTES.ONBOARDING.LOAD_ACTIVATE_BPD}
      component={LoadActivateBpdScreen}
    />
    <BpdOnboardingStack.Screen
      name={BPD_ROUTES.ONBOARDING.ENROLL_PAYMENT_METHODS}
      component={EnrollPaymentMethodsScreen}
    />
    <BpdOnboardingStack.Screen
      name={BPD_ROUTES.ONBOARDING.NO_PAYMENT_METHODS}
      component={NoPaymentMethodsAvailableScreen}
    />
    <BpdOnboardingStack.Screen
      name={BPD_ROUTES.ONBOARDING.ERROR_PAYMENT_METHODS}
      component={ErrorPaymentMethodsScreen}
    />
    <BpdOnboardingStack.Screen
      name={BPD_ROUTES.CTA_START_BPD}
      component={CtaLandingScreen}
    />
  </BpdOnboardingStack.Navigator>
);
const BpdDetailsStack = createStackNavigator<BpdDetailsParamsList>();
export const BpdDetailsNavigator = () => (
  <BpdDetailsStack.Navigator
    initialRouteName={BPD_ROUTES.DETAILS}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <BpdDetailsStack.Screen
      name={BPD_ROUTES.DETAILS}
      component={BpdDetailsScreen}
    />
    <BpdDetailsStack.Screen
      name={BPD_ROUTES.TRANSACTIONS}
      component={BpdTransactionsRouterScreen}
    />
  </BpdDetailsStack.Navigator>
);

const OptInPaymentMethodStack = createStackNavigator<BpdOptInParamsList>();

export const OptInPaymentMethodNavigator = () => (
  <OptInPaymentMethodStack.Navigator
    initialRouteName={BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CASHBACK_UPDATE}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <OptInPaymentMethodStack.Screen
      name={BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CASHBACK_UPDATE}
      component={OptInPaymentMethodsCashbackUpdateScreen}
    />
    <OptInPaymentMethodStack.Screen
      name={BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CHOICE}
      component={OptInPaymentMethodsChoiceScreen}
    />
    <OptInPaymentMethodStack.Screen
      name={BPD_ROUTES.OPT_IN_PAYMENT_METHODS.THANK_YOU_DELETE_METHOD}
      component={OptInPaymentMethodsThankYouDeleteMethodsScreen}
    />
    <OptInPaymentMethodStack.Screen
      name={BPD_ROUTES.OPT_IN_PAYMENT_METHODS.THANK_YOU_KEEP_METHOD}
      component={OptInPaymentMethodsThankYouKeepMethodsScreen}
    />
  </OptInPaymentMethodStack.Navigator>
);
