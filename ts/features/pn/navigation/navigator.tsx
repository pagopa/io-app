import { createStackNavigator } from "@react-navigation/stack";
import { SendAARErrorScreen } from "../aar/screen/SendAARErrorScreen";
import { SendEngagementScreen } from "../aar/screen/SendEngagementScreen";
import { SendQRScanFlowScreen } from "../aar/screen/SendQRScanFlowScreen";
import { PNActivationBannerFlowScreen } from "../reminderBanner/screens/PnReminderBannerFlow";
import { MessageAttachmentScreen } from "../screens/MessageAttachmentScreen";
import { MessageDetailsScreen } from "../screens/MessageDetailsScreen";
import { PaidPaymentScreen } from "../screens/PaidPaymentScreen";
import { SendEngagementOnFirstAppOpenScreen } from "../loginEngagement/screens/SendEngagementOnFirstAppOpenScreen";
import { SendActivationErrorScreen } from "../loginEngagement/screens/SendActivationErrorScreen";
import { PnParamsList } from "./params";
import PN_ROUTES from "./routes";

const Stack = createStackNavigator<PnParamsList>();
const hiddenHeader = {
  headerShown: false
};

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
      options={hiddenHeader}
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
      name={PN_ROUTES.SEND_ENGAGEMENT_ON_FIRST_APP_OPENING}
      component={SendEngagementOnFirstAppOpenScreen}
      options={hiddenHeader}
    />
    <Stack.Screen
      name={PN_ROUTES.SEND_ENGAGEMENT_ACTIVATION_ERROR}
      component={SendActivationErrorScreen}
      options={hiddenHeader}
    />
    <Stack.Screen
      name={PN_ROUTES.SEND_AAR_ERROR}
      component={SendAARErrorScreen}
      options={hiddenHeader}
    />
  </Stack.Navigator>
);
