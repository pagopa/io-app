import { PathConfigMap } from "@react-navigation/core";
import { createStackNavigator } from "@react-navigation/stack";

import { AppParamsList } from "../../../../navigation/params/AppParamsList";
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
import CgnDiscountCodeScreen from "../screens/discount/CgnDiscountCodeScreen";
import CgnDiscountDetailScreen from "../screens/discount/CgnDiscountDetailScreen";
import CGNDiscountExpiredScreen from "../screens/discount/CGNDiscountExpiredScreen";
import EycaActivationLoading from "../screens/eyca/activation/EycaActivationLoading";
import CgnMerchantDetailScreen from "../screens/merchants/CgnMerchantDetailScreen";
import CgnMerchantLandingWebview from "../screens/merchants/CgnMerchantLandingWebview";
import CgnMerchantsCategoriesSelectionScreen from "../screens/merchants/CgnMerchantsCategoriesSelectionScreen";
import { CgnMerchantSearchScreen } from "../screens/merchants/CgnMerchantSearchScreen";
import CgnMerchantsListByCategory from "../screens/merchants/CgnMerchantsListByCategory";
import {
  CgnActivationParamsList,
  CgnDetailsParamsList,
  CgnEYCAActivationParamsList
} from "./params";
import CGN_ROUTES from "./routes";

export const cgnLinkingOptions: PathConfigMap<
  AppParamsList | CgnActivationParamsList
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
      component={CgnInformationScreen}
      name={CGN_ROUTES.ACTIVATION.INFORMATION_TOS}
      options={{ headerShown: false }}
    />
    <ActivationStack.Screen
      component={CgnActivationLoadingScreen}
      name={CGN_ROUTES.ACTIVATION.LOADING}
      options={{ headerShown: false }}
    />
    <ActivationStack.Screen
      component={CgnActivationPendingScreen}
      name={CGN_ROUTES.ACTIVATION.PENDING}
      options={{ headerShown: false }}
    />
    <ActivationStack.Screen
      component={CgnAlreadyActiveScreen}
      name={CGN_ROUTES.ACTIVATION.EXISTS}
      options={{ headerShown: false }}
    />
    <ActivationStack.Screen
      component={CgnActivationTimeoutScreen}
      name={CGN_ROUTES.ACTIVATION.TIMEOUT}
      options={{ headerShown: false }}
    />
    <ActivationStack.Screen
      component={CgnActivationIneligibleScreen}
      name={CGN_ROUTES.ACTIVATION.INELIGIBLE}
      options={{ headerShown: false }}
    />
    <ActivationStack.Screen
      component={CgnActivationCompletedScreen}
      name={CGN_ROUTES.ACTIVATION.COMPLETED}
      options={{ headerShown: false }}
    />
    <ActivationStack.Screen
      component={CgnCTAStartActivationScreen}
      name={CGN_ROUTES.ACTIVATION.CTA_START_CGN}
      options={{ headerShown: false }}
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
      component={CgnDetailScreen}
      name={CGN_ROUTES.DETAILS.DETAILS}
      options={{ headerShown: true }}
    />
    <DetailStack.Screen
      component={CgnMerchantsCategoriesSelectionScreen}
      name={CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES}
      options={{ headerShown: true, headerTransparent: true }}
    />
    <DetailStack.Screen
      component={CgnMerchantsListByCategory}
      name={CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY}
      options={{ headerShown: true }}
    />
    <DetailStack.Screen
      component={CgnMerchantDetailScreen}
      name={CGN_ROUTES.DETAILS.MERCHANTS.DETAIL}
    />
    <DetailStack.Screen
      component={CgnMerchantLandingWebview}
      name={CGN_ROUTES.DETAILS.MERCHANTS.LANDING_WEBVIEW}
      options={{ headerShown: false }}
    />
    <DetailStack.Screen
      component={CgnDiscountDetailScreen}
      name={CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT}
    />
    <DetailStack.Screen
      component={CgnDiscountCodeScreen}
      name={CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT_CODE}
      options={{
        presentation: "modal"
      }}
    />
    <DetailStack.Screen
      component={CGNDiscountExpiredScreen}
      name={CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT_CODE_FAILURE}
      options={{
        headerShown: false
      }}
    />
    <DetailStack.Screen
      component={CgnMerchantSearchScreen}
      name={CGN_ROUTES.DETAILS.MERCHANTS.SEARCH}
      options={{
        headerShown: false
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
      component={EycaActivationLoading}
      name={CGN_ROUTES.EYCA.ACTIVATION.LOADING}
    />
  </EycaActivationStack.Navigator>
);
