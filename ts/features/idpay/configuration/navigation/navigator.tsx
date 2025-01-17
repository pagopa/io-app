import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../utils/navigation";
import {
  IdPayConfigurationMachineContext,
  IDPayConfigurationMachineProvider
} from "../machine/provider";
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

export const IdPayConfigurationNavigator = () => (
  <IDPayConfigurationMachineProvider>
    <InnerNavigator />
  </IDPayConfigurationMachineProvider>
);

const InnerNavigator = () => {
  const idPayConfigurationMachineRef =
    IdPayConfigurationMachineContext.useActorRef();

  return (
    <Stack.Navigator
      initialRouteName={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
      screenListeners={{
        beforeRemove: () => {
          // Read more on https://reactnavigation.org/docs/preventing-going-back/
          // Whenever we have a back navigation action we send a "back" event to the machine.
          // Since the back event is accepted only by specific states, we can safely send a back event to each machine
          idPayConfigurationMachineRef.send({ type: "back" });
        }
      }}
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
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_DISCOUNT_INSTRUMENTS}
        component={IdPayDiscountInstrumentsScreen}
      />
    </Stack.Navigator>
  );
};
