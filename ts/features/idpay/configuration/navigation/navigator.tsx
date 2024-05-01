import { RouteProp, useRoute } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import { IDPayConfigurationMachineProvider } from "../machine/provider";
import { ConfigurationSuccessScreen } from "../screens/ConfigurationSuccessScreen";
import { IbanConfigurationLanding } from "../screens/IbanConfigurationLandingScreen";
import { IbanEnrollmentScreen } from "../screens/IbanEnrollmentScreen";
import { IbanOnboardingScreen } from "../screens/IbanOnboardingScreen";
import { IdPayDiscountInstrumentsScreen } from "../screens/IdPayDiscountInstrumentsScreen";
import { InitiativeConfigurationIntroScreen } from "../screens/InitiativeConfigurationIntroScreen";
import { InstrumentsEnrollmentScreen } from "../screens/InstrumentsEnrollmentScreen";
import { IdPayConfigurationParamsList } from "./params";
import { IdPayConfigurationRoutes } from "./routes";

const Stack = createStackNavigator<IdPayConfigurationParamsList>();

type IdPayConfigurationRouteProps = RouteProp<
  IdPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_NAVIGATOR"
>;

export const IdPayConfigurationNavigator = () => {
  const { params } = useRoute<IdPayConfigurationRouteProps>();
  const { initiativeId, mode } = params;

  return (
    <IDPayConfigurationMachineProvider input={{ initiativeId, mode }}>
      <Stack.Navigator
        initialRouteName={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO}
        screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
      >
        <Stack.Screen
          name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO}
          component={InitiativeConfigurationIntroScreen}
        />

        <Stack.Screen
          name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT}
          component={IbanEnrollmentScreen}
        />

        <Stack.Screen
          name={
            IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT
          }
          component={InstrumentsEnrollmentScreen}
        />

        <Stack.Screen
          name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING}
          component={IbanConfigurationLanding}
        />

        <Stack.Screen
          name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING}
          component={IbanOnboardingScreen}
        />

        <Stack.Screen
          name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_SUCCESS}
          component={ConfigurationSuccessScreen}
        />

        <Stack.Screen
          name={
            IdPayConfigurationRoutes.IDPAY_CONFIGURATION_DISCOUNT_INSTRUMENTS
          }
          component={IdPayDiscountInstrumentsScreen}
        />
      </Stack.Navigator>
    </IDPayConfigurationMachineProvider>
  );
};
