import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import IbanEnrollmentScreen, {
  IbanEnrollmentScreenRouteParams
} from "../screens/IbanEnrollmentScreen";
import InitiativeConfigurationIntroScreen, {
  InitiativeConfigurationIntroScreenRouteParams
} from "../screens/InitiativeConfigurationIntroScreen";
import ConfigurationSuccessScreen from "../screens/ConfigurationSuccessScreen";
import IbanConfigurationLanding from "../screens/IbanConfigurationLandingScreen";
import IbanOnboardingScreen from "../screens/IbanOnboardingScreen";
import InstrumentsEnrollmentScreen, {
  InstrumentsEnrollmentScreenRouteParams
} from "../screens/InstrumentsEnrollmentScreen";
import { IDPayConfigurationMachineProvider } from "../xstate/provider";
import { isGestureEnabled } from "../../../../../utils/navigation";

export const IDPayConfigurationRoutes = {
  IDPAY_CONFIGURATION_MAIN: "IDPAY_CONFIGURATION_MAIN",
  IDPAY_CONFIGURATION_INTRO: "IDPAY_CONFIGURATION_INTRO",
  IDPAY_CONFIGURATION_IBAN_LANDING: "IDPAY_CONFIGURATION_IBAN_LANDING",
  IDPAY_CONFIGURATION_IBAN_ONBOARDING: "IDPAY_CONFIGURATION_IBAN_ONBOARDING",
  IDPAY_CONFIGURATION_IBAN_ENROLLMENT: "IDPAY_CONFIGURATION_IBAN_ENROLLMENT",
  IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT:
    "IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT",
  IDPAY_CONFIGURATION_SUCCESS: "IDPAY_CONFIGURATION_SUCCESS"
} as const;

export type IDPayConfigurationParamsList = {
  [IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO]: InitiativeConfigurationIntroScreenRouteParams;
  [IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING]: undefined;
  [IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING]: undefined;
  [IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT]: IbanEnrollmentScreenRouteParams;
  [IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT]: InstrumentsEnrollmentScreenRouteParams;
  [IDPayConfigurationRoutes.IDPAY_CONFIGURATION_SUCCESS]: undefined;
};

const Stack = createStackNavigator<IDPayConfigurationParamsList>();

export const IDPayConfigurationNavigator = () => (
  <IDPayConfigurationMachineProvider>
    <Stack.Navigator
      initialRouteName={IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO}
      headerMode={"none"}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
    >
      <Stack.Screen
        name={IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO}
        component={InitiativeConfigurationIntroScreen}
      />

      <Stack.Screen
        name={IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT}
        component={IbanEnrollmentScreen}
      />

      <Stack.Screen
        name={
          IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT
        }
        component={InstrumentsEnrollmentScreen}
      />

      <Stack.Screen
        name={IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING}
        component={IbanConfigurationLanding}
      />

      <Stack.Screen
        name={IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING}
        component={IbanOnboardingScreen}
      />

      <Stack.Screen
        name={IDPayConfigurationRoutes.IDPAY_CONFIGURATION_SUCCESS}
        component={ConfigurationSuccessScreen}
      />
    </Stack.Navigator>
  </IDPayConfigurationMachineProvider>
);
