import { PathConfigMap } from "@react-navigation/core";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { AppParamsList } from "../../../../navigation/params/AppParamsList";
import { isGestureEnabled } from "../../../../utils/navigation";
import CgnDetailScreen from "../screens/CgnDetailScreen";
import CgnActivationCompletedScreen from "../screens/activation/CgnActivationCompletedScreen";
import CgnActivationIneligibleScreen from "../screens/activation/CgnActivationIneligibleScreen";
import CgnActivationLoadingScreen from "../screens/activation/CgnActivationLoadingScreen";
import CgnActivationPendingScreen from "../screens/activation/CgnActivationPendingScreen";
import CgnActivationTimeoutScreen from "../screens/activation/CgnActivationTimeoutScreen";
import CgnAlreadyActiveScreen from "../screens/activation/CgnAlreadyActiveScreen";
import CgnCTAStartActivationScreen from "../screens/activation/CgnCTAStartActivationScreen";
import CgnInformationScreen from "../screens/activation/CgnInformationScreen";
import EycaActivationLoading from "../screens/eyca/activation/EycaActivationLoading";
import CgnMerchantDetailScreen from "../screens/merchants/CgnMerchantDetailScreen";
import CgnMerchantLandingWebview from "../screens/merchants/CgnMerchantLandingWebview";
import CgnMerchantsCategoriesSelectionScreen from "../screens/merchants/CgnMerchantsCategoriesSelectionScreen";
import CgnMerchantsListByCategory from "../screens/merchants/CgnMerchantsListByCategory";
import CgnMerchantsTabsScreen from "../screens/merchants/CgnMerchantsTabsScreen";
import CgnDiscountDetailScreen from "../screens/discount/CgnDiscountDetailScreen";
import CgnDiscountCodeScreen from "../screens/discount/CgnDiscountCodeScreen";
import {
  CgnActivationParamsList,
  CgnDetailsParamsList,
  CgnEYCAActivationParamsList
} from "./params";
import CGN_ROUTES from "./routes";

export const cgnLinkingOptions: PathConfigMap<
  CgnActivationParamsList | AppParamsList
> = {
  [CGN_ROUTES.DETAILS.MAIN]: {
    path: "cgn-details",
    screens: {
      [CGN_ROUTES.DETAILS.DETAILS]: "detail",
      [CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES]: "categories",
      [CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY]:
        "categories-merchant/:category"
    }
  },
  [CGN_ROUTES.ACTIVATION.MAIN]: {
    path: "cgn-activation",
    screens: {
      [CGN_ROUTES.ACTIVATION.CTA_START_CGN]: "start"
    }
  }
};

const ActivationStack = createStackNavigator<CgnActivationParamsList>();

export const CgnActivationNavigator = () => (
  <ActivationStack.Navigator
    initialRouteName={CGN_ROUTES.ACTIVATION.INFORMATION_TOS}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.INFORMATION_TOS}
      component={CgnInformationScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.LOADING}
      options={{ headerShown: false }}
      component={CgnActivationLoadingScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.PENDING}
      options={{ headerShown: false }}
      component={CgnActivationPendingScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.EXISTS}
      options={{ headerShown: false }}
      component={CgnAlreadyActiveScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.TIMEOUT}
      options={{ headerShown: false }}
      component={CgnActivationTimeoutScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.INELIGIBLE}
      options={{ headerShown: false }}
      component={CgnActivationIneligibleScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.COMPLETED}
      options={{ headerShown: false }}
      component={CgnActivationCompletedScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.CTA_START_CGN}
      options={{ headerShown: false }}
      component={CgnCTAStartActivationScreen}
    />
  </ActivationStack.Navigator>
);

const DetailStack = createStackNavigator<CgnDetailsParamsList>();

export const CgnDetailsNavigator = () => (
  <DetailStack.Navigator
    initialRouteName={CGN_ROUTES.DETAILS.DETAILS}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <DetailStack.Screen
      name={CGN_ROUTES.DETAILS.DETAILS}
      options={{ headerShown: true }}
      component={CgnDetailScreen}
    />
    <DetailStack.Screen
      name={CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES}
      options={{ headerShown: true }}
      component={CgnMerchantsCategoriesSelectionScreen}
    />
    <DetailStack.Screen
      name={CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY}
      options={{ headerShown: true }}
      component={CgnMerchantsListByCategory}
    />
    <DetailStack.Screen
      name={CGN_ROUTES.DETAILS.MERCHANTS.TABS}
      component={CgnMerchantsTabsScreen}
    />
    <DetailStack.Screen
      name={CGN_ROUTES.DETAILS.MERCHANTS.DETAIL}
      component={CgnMerchantDetailScreen}
    />
    <DetailStack.Screen
      name={CGN_ROUTES.DETAILS.MERCHANTS.LANDING_WEBVIEW}
      options={{ headerShown: false }}
      component={CgnMerchantLandingWebview}
    />
    <DetailStack.Screen
      name={CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT}
      component={CgnDiscountDetailScreen}
    />
    <DetailStack.Screen
      name={CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT_CODE}
      component={CgnDiscountCodeScreen}
      options={{
        presentation: "modal"
      }}
    />
  </DetailStack.Navigator>
);

const EycaActivationStack = createStackNavigator<CgnEYCAActivationParamsList>();

export const CgnEYCAActivationNavigator = () => (
  <EycaActivationStack.Navigator
    initialRouteName={CGN_ROUTES.EYCA.ACTIVATION.LOADING}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <EycaActivationStack.Screen
      name={CGN_ROUTES.EYCA.ACTIVATION.LOADING}
      component={EycaActivationLoading}
    />
  </EycaActivationStack.Navigator>
);
