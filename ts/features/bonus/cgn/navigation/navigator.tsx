import { PathConfigMap } from "@react-navigation/core";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import CgnActivationCompletedScreen from "../screens/activation/CgnActivationCompletedScreen";
import CgnActivationIneligibleScreen from "../screens/activation/CgnActivationIneligibleScreen";
import CgnActivationLoadingScreen from "../screens/activation/CgnActivationLoadingScreen";
import CgnActivationPendingScreen from "../screens/activation/CgnActivationPendingScreen";
import CgnActivationTimeoutScreen from "../screens/activation/CgnActivationTimeoutScreen";
import CgnAlreadyActiveScreen from "../screens/activation/CgnAlreadyActiveScreen";
import CgnCTAStartActivationScreen from "../screens/activation/CgnCTAStartActivationScreen";
import CgnInformationScreen from "../screens/activation/CgnInformationScreen";
import CgnDetailScreen from "../screens/CgnDetailScreen";
import EycaActivationLoading from "../screens/eyca/activation/EycaActivationLoading";
import CgnMerchantDetailScreen from "../screens/merchants/CgnMerchantDetailScreen";
import CgnMerchantLandingWebview from "../screens/merchants/CgnMerchantLandingWebview";
import CgnMerchantsCategoriesSelectionScreen from "../screens/merchants/CgnMerchantsCategoriesSelectionScreen";
import CgnMerchantsListByCategory from "../screens/merchants/CgnMerchantsListByCategory";
import MerchantsListScreen from "../screens/merchants/CgnMerchantsListScreen";
import CgnMerchantsTabsScreen from "../screens/merchants/CgnMerchantsTabsScreen";
import {
  CgnActivationParamsList,
  CgnDetailsParamsList,
  CgnEYCAActivationParamsList
} from "./params";
import CGN_ROUTES from "./routes";

export const cgnLinkingOptions: PathConfigMap = {
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
    headerMode="none"
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.INFORMATION_TOS}
      component={CgnInformationScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.LOADING}
      component={CgnActivationLoadingScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.PENDING}
      component={CgnActivationPendingScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.EXISTS}
      component={CgnAlreadyActiveScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.TIMEOUT}
      component={CgnActivationTimeoutScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.INELIGIBLE}
      component={CgnActivationIneligibleScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.COMPLETED}
      component={CgnActivationCompletedScreen}
    />
    <ActivationStack.Screen
      name={CGN_ROUTES.ACTIVATION.CTA_START_CGN}
      component={CgnCTAStartActivationScreen}
    />
  </ActivationStack.Navigator>
);

const DetailStack = createStackNavigator<CgnDetailsParamsList>();

export const CgnDetailsNavigator = () => (
  <DetailStack.Navigator
    initialRouteName={CGN_ROUTES.DETAILS.DETAILS}
    headerMode="none"
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <DetailStack.Screen
      name={CGN_ROUTES.DETAILS.DETAILS}
      component={CgnDetailScreen}
    />
    <DetailStack.Screen
      name={CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES}
      component={CgnMerchantsCategoriesSelectionScreen}
    />
    <DetailStack.Screen
      name={CGN_ROUTES.DETAILS.MERCHANTS.LIST}
      component={MerchantsListScreen}
    />
    <DetailStack.Screen
      name={CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY}
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
      component={CgnMerchantLandingWebview}
    />
  </DetailStack.Navigator>
);

const EycaActivationStack = createStackNavigator<CgnEYCAActivationParamsList>();

export const CgnEYCAActivationNavigator = () => (
  <EycaActivationStack.Navigator
    initialRouteName={CGN_ROUTES.EYCA.ACTIVATION.LOADING}
    headerMode="none"
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <EycaActivationStack.Screen
      name={CGN_ROUTES.EYCA.ACTIVATION.LOADING}
      component={EycaActivationLoading}
    />
  </EycaActivationStack.Navigator>
);
