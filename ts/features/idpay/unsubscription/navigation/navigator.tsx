import { createStackNavigator } from "@react-navigation/stack";
import UnsubscriptionConfirmationScreen from "../screens/UnsubscriptionConfirmationScreen";
import UnsubscriptionResultScreen from "../screens/UnsubscriptionResultScreen";
import { IdPayUnsubscriptionParamsList } from "./params";
import { IdPayUnsubscriptionRoutes } from "./routes";

const Stack = createStackNavigator<IdPayUnsubscriptionParamsList>();

export const IdPayUnsubscriptionNavigator = () => (
  <Stack.Navigator
    initialRouteName={
      IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION
    }
  >
    <Stack.Screen
      name={IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION}
      component={UnsubscriptionConfirmationScreen}
    />
    <Stack.Screen
      name={IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT}
      component={UnsubscriptionResultScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);
