import { createStackNavigator } from "@react-navigation/stack";
import { SendAARCieCardReadingScreen } from "../aar/screen/SendAARCieCardReadingScreen";
import { SendAARErrorScreen } from "../aar/screen/SendAARErrorScreen";
import { SendAarDelegationProposalScreen } from "../aar/screen/SendAarDelegationProposalScreen";
import { SendEngagementScreen } from "../aar/screen/SendEngagementScreen";
import { SendQRScanFlowScreen } from "../aar/screen/SendQRScanFlowScreen";
import { SendActivationErrorScreen } from "../loginEngagement/screens/SendActivationErrorScreen";
import { SendEngagementOnFirstAppOpenScreen } from "../loginEngagement/screens/SendEngagementOnFirstAppOpenScreen";
import { PNActivationBannerFlowScreen } from "../reminderBanner/screens/PnReminderBannerFlow";
import { MessageAttachmentScreen } from "../screens/MessageAttachmentScreen";
import { MessageDetailsScreen } from "../screens/MessageDetailsScreen";
import { PaidPaymentScreen } from "../screens/PaidPaymentScreen";
import { SendAarCieCanInsertionScreen } from "../aar/screen/SendAarCieCanInsertionScreen";
import { SendAarCanEducationalScreen } from "../aar/screen/SendAarCanEducationalScreen";
import { SendAarCieCardReadingEducationalScreen } from "../aar/screen/SendAarCieCardReadingEducationalScreen";
import { SendAarActivateNfcScreen } from "../aar/screen/SendAarActivateNfcScreen";
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
    <Stack.Screen
      name={PN_ROUTES.SEND_AAR_DELEGATION_PROPOSAL}
      component={SendAarDelegationProposalScreen}
      options={hiddenHeader}
    />
    <Stack.Screen
      name={PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL}
      component={SendAarCanEducationalScreen}
    />
    <Stack.Screen
      name={PN_ROUTES.SEND_AAR_CIE_CAN_INSERTION}
      component={SendAarCieCanInsertionScreen}
    />
    <Stack.Screen
      name={PN_ROUTES.SEND_AAR_CIE_CARD_READING_EDUCATIONAL}
      component={SendAarCieCardReadingEducationalScreen}
    />
    <Stack.Screen
      name={PN_ROUTES.SEND_AAR_NFC_ACTIVATION}
      component={SendAarActivateNfcScreen}
      options={{ presentation: "modal" }}
    />
    <Stack.Screen
      name={PN_ROUTES.SEND_AAR_CIE_CARD_READING}
      component={SendAARCieCardReadingScreen}
      options={hiddenHeader}
    />
  </Stack.Navigator>
);
