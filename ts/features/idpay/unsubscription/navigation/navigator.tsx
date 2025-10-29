import { createStackNavigator } from "@react-navigation/stack";
import IdPayUnsubscriptionConfirmationScreen from "../screens/IdPayUnsubscriptionConfirmationScreen";
import IdPayUnsubscriptionResultScreen from "../screens/IdPayUnsubscriptionResultScreen";
import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";
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
        name={IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION}
        component={IdPayUnsubscriptionConfirmationScreen}
      />
      <Stack.Screen
        name={IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT}
        component={IdPayUnsubscriptionResultScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </IdPayFeatureFlagGuard>
);
