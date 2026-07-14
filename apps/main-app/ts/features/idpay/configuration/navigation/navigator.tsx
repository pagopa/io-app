import { createStackNavigator } from "@react-navigation/stack";

import { isGestureEnabled } from "../../../../utils/navigation";
import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";
import {
  IdPayConfigurationMachineContext,
  IDPayConfigurationMachineProvider
} from "../machine/provider";
import { IdPayConfigurationSuccessScreen } from "../screens/IdPayConfigurationSuccessScreen";
import { IdPayDiscountInstrumentsScreen } from "../screens/IdPayDiscountInstrumentsScreen";
import { IdPayIbanConfigurationLandingScreen } from "../screens/IdPayIbanConfigurationLandingScreen";
import { IdPayIbanEnrollmentScreen } from "../screens/IdPayIbanEnrollmentScreen";
import { IdPayIbanOnboardingScreen } from "../screens/IdPayIbanOnboardingScreen";
import { IdPayInitiativeConfigurationIntroScreen } from "../screens/IdPayInitiativeConfigurationIntroScreen";
import { IdPayInstrumentsEnrollmentScreen } from "../screens/IdPayInstrumentsEnrollmentScreen";
import { IdPayConfigurationParamsList } from "./params";
import { IdPayConfigurationRoutes } from "./routes";

const Stack = createStackNavigator<IdPayConfigurationParamsList>();

export const IdPayConfigurationNavigator = () => (
  <IDPayConfigurationMachineProvider>
    <IdPayFeatureFlagGuard>
      <InnerNavigator />
    </IdPayFeatureFlagGuard>
  </IDPayConfigurationMachineProvider>
);

const InnerNavigator = () => {
  const idPayConfigurationMachineRef =
    IdPayConfigurationMachineContext.useActorRef();

  return (
    <Stack.Navigator
      initialRouteName={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO}
      screenListeners={{
        beforeRemove: () => {
          // Read more on https://reactnavigation.org/docs/preventing-going-back/
          // Whenever we have a back navigation action we send a "back" event to the machine.
          // Since the back event is accepted only by specific states, we can safely send a back event to each machine
          idPayConfigurationMachineRef.send({ type: "back" });
        }
      }}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
    >
      <Stack.Screen
        component={IdPayInitiativeConfigurationIntroScreen}
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO}
      />

      <Stack.Screen
        component={IdPayIbanEnrollmentScreen}
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT}
      />

      <Stack.Screen
        component={IdPayInstrumentsEnrollmentScreen}
        name={
          IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT
        }
      />

      <Stack.Screen
        component={IdPayIbanConfigurationLandingScreen}
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING}
      />

      <Stack.Screen
        component={IdPayIbanOnboardingScreen}
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING}
      />

      <Stack.Screen
        component={IdPayConfigurationSuccessScreen}
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_SUCCESS}
      />

      <Stack.Screen
        component={IdPayDiscountInstrumentsScreen}
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_DISCOUNT_INSTRUMENTS}
      />
    </Stack.Navigator>
  );
};
