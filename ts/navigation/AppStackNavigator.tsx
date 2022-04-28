/* eslint-disable functional/immutable-data */
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View } from "native-base";
import * as React from "react";
import { useRef } from "react";
import { IOColors } from "../components/core/variables/IOColors";
import workunitGenericFailure from "../components/error/WorkunitGenericFailure";
import {
  CgnActivationNavigator,
  CgnDetailsNavigator,
  CgnEYCAActivationNavigator
} from "../features/bonus/cgn/navigation/navigator";
import CGN_ROUTES from "../features/bonus/cgn/navigation/routes";
import UADONATION_ROUTES from "../features/uaDonations/navigation/routes";
import { UAWebViewScreen } from "../features/uaDonations/screens/UAWebViewScreen";
import { zendeskSupportNavigator } from "../features/zendesk/navigation/navigator";
import ZENDESK_ROUTES from "../features/zendesk/navigation/routes";
import IngressScreen from "../screens/ingress/IngressScreen";
import { setDebugCurrentRouteName } from "../store/actions/debug";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { trackScreen } from "../store/middlewares/navigation";
import { isTestEnv } from "../utils/environment";
import { CDC_ROUTES } from "../features/bonus/cdc/navigation/routes";
import { CdcStackNavigator } from "../features/bonus/cdc/navigation/CdcStackNavigator";
import { isCdcEnabledSelector } from "../store/reducers/backendStatus";
import authenticationNavigator from "./AuthenticationNavigator";
import messagesNavigator from "./MessagesNavigator";
import NavigationService, { navigationRef } from "./NavigationService";
import onboardingNavigator from "./OnboardingNavigator";
import { AppParamsList } from "./params/AppParamsList";
import profileNavigator from "./ProfileNavigator";
import ROUTES from "./routes";
import servicesNavigator from "./ServicesNavigator";
import { MainTabNavigator } from "./TabNavigator";
import walletNavigator from "./WalletNavigator";

const Stack = createStackNavigator<AppParamsList>();

export const AppStackNavigator = () => {
  const cdcEnabled = useIOSelector(isCdcEnabledSelector);

  return (
    <Stack.Navigator
      initialRouteName={"INGRESS"}
      headerMode={"none"}
      screenOptions={{ gestureEnabled: false }}
    >
      <Stack.Screen name={ROUTES.INGRESS} component={IngressScreen} />
      <Stack.Screen
        name={ROUTES.AUTHENTICATION}
        component={authenticationNavigator}
      />
      <Stack.Screen name={ROUTES.ONBOARDING} component={onboardingNavigator} />
      <Stack.Screen name={ROUTES.MAIN} component={MainTabNavigator} />

      <Stack.Screen
        name={ROUTES.MESSAGES_NAVIGATOR}
        component={messagesNavigator}
      />
      <Stack.Screen
        name={ROUTES.WALLET_NAVIGATOR}
        component={walletNavigator}
      />
      <Stack.Screen
        name={ROUTES.SERVICES_NAVIGATOR}
        component={servicesNavigator}
      />
      <Stack.Screen
        name={ROUTES.PROFILE_NAVIGATOR}
        component={profileNavigator}
      />

      <Stack.Screen
        name={CGN_ROUTES.ACTIVATION.MAIN}
        component={CgnActivationNavigator}
      />

      <Stack.Screen
        name={CGN_ROUTES.DETAILS.MAIN}
        component={CgnDetailsNavigator}
      />

      <Stack.Screen
        name={CGN_ROUTES.EYCA.ACTIVATION.MAIN}
        component={CgnEYCAActivationNavigator}
      />

      <Stack.Screen
        name={ROUTES.WORKUNIT_GENERIC_FAILURE}
        component={workunitGenericFailure}
      />
      <Stack.Screen
        name={ZENDESK_ROUTES.MAIN}
        component={zendeskSupportNavigator}
      />
      <Stack.Screen
        name={UADONATION_ROUTES.WEBVIEW}
        component={UAWebViewScreen}
      />

      {cdcEnabled && (
        <Stack.Screen
          name={CDC_ROUTES.BONUS_REQUEST_MAIN}
          component={CdcStackNavigator}
        />
      )}
    </Stack.Navigator>
  );
};

const IOTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: IOColors.white
  }
};

const InnerNavigationContainer = (props: { children: React.ReactElement }) => {
  const routeNameRef = useRef<string>();
  const dispatch = useIODispatch();

  return (
    <NavigationContainer
      theme={IOTheme}
      ref={navigationRef}
      onReady={() => {
        NavigationService.setNavigationReady();
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

        if (currentRouteName !== undefined) {
          dispatch(setDebugCurrentRouteName(currentRouteName));
          trackScreen(previousRouteName, currentRouteName);
        }
        routeNameRef.current = currentRouteName;
      }}
    >
      {props.children}
    </NavigationContainer>
  );
};

/**
 * Wraps the NavigationContainer with the AppStackNavigator (Root navigator of the app)
 * @constructor
 */
export const IONavigationContainer = () => (
  <InnerNavigationContainer>
    <AppStackNavigator />
  </InnerNavigationContainer>
);

export const TestInnerNavigationContainer = isTestEnv
  ? InnerNavigationContainer
  : View;
