import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { IDPayConfigurationMachineProvider } from "../xstate/provider";
import InitiativeConfigurationIntroScreen, {
  InitiativeConfigurationIntroScreenRouteParams
} from "../screens/InitiativeConfigurationIntroScreen";

export const IDPayConfigurationRoutes = {
  IDPAY_CONFIGURATION_MAIN: "IDPAY_CONFIGURATION_MAIN",
  IDPAY_CONFIGURATION_INTRO: "IDPAY_CONFIGURATION_INTRO"
} as const;

export type IDPayConfigurationParamsList = {
  [IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO]: InitiativeConfigurationIntroScreenRouteParams;
};

const Stack = createStackNavigator<IDPayConfigurationParamsList>();

export const IDPayConfigurationNavigator = () => (
  <IDPayConfigurationMachineProvider>
    <Stack.Navigator
      initialRouteName={IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name={IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO}
        component={InitiativeConfigurationIntroScreen}
      />
    </Stack.Navigator>
  </IDPayConfigurationMachineProvider>
);
