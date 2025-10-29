import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../utils/navigation";
import {
  IdPayConfigurationMachineContext,
  IDPayConfigurationMachineProvider
} from "../machine/provider";
import { IdPayConfigurationSuccessScreen } from "../screens/IdPayConfigurationSuccessScreen";
import { IdPayIbanConfigurationLandingScreen } from "../screens/IdPayIbanConfigurationLandingScreen";
import { IdPayIbanEnrollmentScreen } from "../screens/IdPayIbanEnrollmentScreen";
import { IdPayIbanOnboardingScreen } from "../screens/IdPayIbanOnboardingScreen";
import { IdPayDiscountInstrumentsScreen } from "../screens/IdPayDiscountInstrumentsScreen";
import { IdPayInitiativeConfigurationIntroScreen } from "../screens/IdPayInitiativeConfigurationIntroScreen";
import { IdPayInstrumentsEnrollmentScreen } from "../screens/IdPayInstrumentsEnrollmentScreen";
import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";
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
        component={IdPayInitiativeConfigurationIntroScreen}
      />

      <Stack.Screen
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT}
        component={IdPayIbanEnrollmentScreen}
      />

      <Stack.Screen
        name={
          IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT
        }
        component={IdPayInstrumentsEnrollmentScreen}
      />

      <Stack.Screen
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING}
        component={IdPayIbanConfigurationLandingScreen}
      />

      <Stack.Screen
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING}
        component={IdPayIbanOnboardingScreen}
      />

      <Stack.Screen
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_SUCCESS}
        component={IdPayConfigurationSuccessScreen}
      />

      <Stack.Screen
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_DISCOUNT_INSTRUMENTS}
        component={IdPayDiscountInstrumentsScreen}
      />
    </Stack.Navigator>
  );
};
