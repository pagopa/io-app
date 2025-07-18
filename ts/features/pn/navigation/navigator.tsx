import { createStackNavigator } from "@react-navigation/stack";
import { SendQrScanFlow } from "../qrCodeScan/screens/QrScanFlow";
import { PNActivationBannerFlowScreen } from "../reminderBanner/screens/PnReminderBannerFlow";
import { MessageAttachmentScreen } from "../screens/MessageAttachmentScreen";
import { MessageDetailsScreen } from "../screens/MessageDetailsScreen";
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
    <Stack.Screen
      name={PN_ROUTES.ACTIVATION_BANNER_FLOW}
      component={PNActivationBannerFlowScreen}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PN_ROUTES.QR_SCAN_FLOW}
      component={SendQrScanFlow}
      options={{
        headerShown: false
      }}
    />
  </Stack.Navigator>
);
