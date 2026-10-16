import { createStackNavigator } from "@react-navigation/stack";

import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";
import IdPayUnsubscriptionConfirmationScreen from "../screens/IdPayUnsubscriptionConfirmationScreen";
import IdPayUnsubscriptionResultScreen from "../screens/IdPayUnsubscriptionResultScreen";
import { IdPayUnsubscriptionParamsList } from "./params";
import { IdPayUnsubscriptionRoutes } from "./routes";

const Stack = createStackNavigator<IdPayUnsubscriptionParamsList>();

export const IdPayUnsubscriptionNavigator = () => (
  <IdPayFeatureFlagGuard>
    <Stack.Navigator
      initialRouteName={
        IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION
      }
    >
      <Stack.Screen
        component={IdPayUnsubscriptionConfirmationScreen}
        name={IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION}
      />
      <Stack.Screen
        component={IdPayUnsubscriptionResultScreen}
        name={IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </IdPayFeatureFlagGuard>
);
