import { createStackNavigator } from "@react-navigation/stack";

import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";
import { IdPayCodeDisplayScreen } from "../screens/IdPayCodeDisplayScreen";
import { IdPayCodeOnboardingScreen } from "../screens/IdPayCodeOnboardingScreen";
import { IdPayCodeRenewScreen } from "../screens/IdPayCodeRenewScreen";
import { IdPayCodeResultScreen } from "../screens/IdPayCodeResultScreen";
import { IdPayCodeParamsList } from "./params";
import { IdPayCodeRoutes } from "./routes";

const Stack = createStackNavigator<IdPayCodeParamsList>();

export const IdPayCodeNavigator = () => (
  <IdPayFeatureFlagGuard>
    <Stack.Navigator
      initialRouteName={IdPayCodeRoutes.IDPAY_CODE_ONBOARDING}
      screenOptions={{ gestureEnabled: false }}
    >
      <Stack.Screen
        component={IdPayCodeOnboardingScreen}
        name={IdPayCodeRoutes.IDPAY_CODE_ONBOARDING}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        component={IdPayCodeDisplayScreen}
        name={IdPayCodeRoutes.IDPAY_CODE_DISPLAY}
      />
      <Stack.Screen
        component={IdPayCodeRenewScreen}
        name={IdPayCodeRoutes.IDPAY_CODE_RENEW}
      />
      <Stack.Screen
        component={IdPayCodeResultScreen}
        name={IdPayCodeRoutes.IDPAY_CODE_RESULT}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </IdPayFeatureFlagGuard>
);
