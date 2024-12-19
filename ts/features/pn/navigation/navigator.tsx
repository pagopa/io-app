import { createStackNavigator } from "@react-navigation/stack";
import { MessageDetailsScreen } from "../screens/MessageDetailsScreen";
import { MessageAttachmentScreen } from "../screens/MessageAttachmentScreen";
import { PaidPaymentScreen } from "../screens/PaidPaymentScreen";
import { PnParamsList } from "./params";
import PN_ROUTES from "./routes";

const Stack = createStackNavigator<PnParamsList>();

export const PnStackNavigator = () => (
  <Stack.Navigator initialRouteName={PN_ROUTES.MESSAGE_DETAILS}>
    <Stack.Screen
      name={PN_ROUTES.MESSAGE_DETAILS}
      component={MessageDetailsScreen}
    />
    <Stack.Screen
      name={PN_ROUTES.MESSAGE_ATTACHMENT}
      component={MessageAttachmentScreen}
    />
    <Stack.Screen
      name={PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT}
      component={PaidPaymentScreen}
    />
  </Stack.Navigator>
);
