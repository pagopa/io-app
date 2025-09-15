import { createStackNavigator } from "@react-navigation/stack";
import { SendAARLoadingScreen } from "../aar/screen/SendAARLoadingScreen";
import { SendQrScanPushEngagementScreen } from "../aar/screen/SendAARPushEngagementScreen";
import { SendAARTosScreen } from "../aar/screen/SendAARTosScreen";
import { SendEngagementScreen } from "../aar/screen/SendEngagementScreen";
import { SendQRScanFlowScreen } from "../aar/screen/SendQRScanFlowScreen";
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
      component={SendQRScanFlowScreen}
    />
    <Stack.Screen
      name={PN_ROUTES.ENGAGEMENT_SCREEN}
      component={SendEngagementScreen}
    />
    <Stack.Screen
      name={PN_ROUTES.QR_SCAN_PUSH_ENGAGEMENT}
      component={SendQrScanPushEngagementScreen}
    />
    <Stack.Screen
      name={PN_ROUTES.SEND_AAR_TOS_SCREEN}
      component={SendAARTosScreen}
    />
    <Stack.Screen
      name={PN_ROUTES.SEND_AAR_LOADING_SCREEN}
      component={SendAARLoadingScreen}
    />
  </Stack.Navigator>
);
