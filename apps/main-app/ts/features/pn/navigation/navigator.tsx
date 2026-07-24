import {
  createStackNavigator,
  StackNavigationOptions
} from "@react-navigation/stack";
import _ from "lodash";

import { SendAarActivateNfcScreen } from "../aar/screen/SendAarActivateNfcScreen";
import { SendAarCanEducationalScreen } from "../aar/screen/SendAarCanEducationalScreen";
import { SendAarCieCanInsertionScreen } from "../aar/screen/SendAarCieCanInsertionScreen";
import { SendAarCieCardReadingEducationalScreen } from "../aar/screen/SendAarCieCardReadingEducationalScreen";
import { SendAarCieCardReadingScreen } from "../aar/screen/SendAarCieCardReadingScreen";
import { SendAarDelegationProposalScreen } from "../aar/screen/SendAarDelegationProposalScreen";
import { SendAarErrorScreen } from "../aar/screen/SendAarErrorScreen";
import { SendEngagementScreen } from "../aar/screen/SendEngagementScreen";
import { SendQRScanFlowScreen } from "../aar/screen/SendQRScanFlowScreen";
import { SendActivationErrorScreen } from "../loginEngagement/screens/SendActivationErrorScreen";
import { SendEngagementOnFirstAppOpenScreen } from "../loginEngagement/screens/SendEngagementOnFirstAppOpenScreen";
import { PNActivationBannerFlowScreen } from "../reminderBanner/screens/PnReminderBannerFlow";
import { MessageAttachmentScreen } from "../screens/MessageAttachmentScreen";
import { MessageDetailsScreen } from "../screens/MessageDetailsScreen";
import { PaidPaymentScreen } from "../screens/PaidPaymentScreen";
import { PnParamsList } from "./params";
import PN_ROUTES from "./routes";

const Stack = createStackNavigator<PnParamsList>();
const hiddenHeader = {
  headerShown: false
};

export const PnStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={PN_ROUTES.MESSAGE_DETAILS}
    screenOptions={{
      gestureEnabled: false
    }}
  >
    <Stack.Group>
      <Stack.Screen
        component={MessageDetailsScreen}
        name={PN_ROUTES.MESSAGE_DETAILS}
      />
      <Stack.Screen
        component={MessageAttachmentScreen}
        name={PN_ROUTES.MESSAGE_ATTACHMENT}
      />
      <Stack.Screen
        component={PaidPaymentScreen}
        name={PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT}
      />
      <Stack.Screen
        component={PNActivationBannerFlowScreen}
        name={PN_ROUTES.ACTIVATION_BANNER_FLOW}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={SendEngagementScreen}
        name={PN_ROUTES.ENGAGEMENT_SCREEN}
      />
      <Stack.Screen
        component={SendEngagementOnFirstAppOpenScreen}
        name={PN_ROUTES.SEND_ENGAGEMENT_ON_FIRST_APP_OPENING}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={SendActivationErrorScreen}
        name={PN_ROUTES.SEND_ENGAGEMENT_ACTIVATION_ERROR}
        options={hiddenHeader}
      />
    </Stack.Group>
    <Stack.Group
      screenOptions={({ route }) => {
        const animationType: StackNavigationOptions["animationTypeForReplace"] =
          _.get(route, ["params", "animationTypeForReplace"], undefined);
        return {
          animationTypeForReplace: animationType
        };
      }}
    >
      <Stack.Screen
        component={SendQRScanFlowScreen}
        name={PN_ROUTES.QR_SCAN_FLOW}
      />
      <Stack.Screen
        component={SendAarErrorScreen}
        name={PN_ROUTES.SEND_AAR_ERROR}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={SendAarDelegationProposalScreen}
        name={PN_ROUTES.SEND_AAR_DELEGATION_PROPOSAL}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={SendAarCanEducationalScreen}
        name={PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL}
      />
      <Stack.Screen
        component={SendAarCieCanInsertionScreen}
        name={PN_ROUTES.SEND_AAR_CIE_CAN_INSERTION}
      />
      <Stack.Screen
        component={SendAarCieCardReadingEducationalScreen}
        name={PN_ROUTES.SEND_AAR_CIE_CARD_READING_EDUCATIONAL}
      />
      <Stack.Screen
        component={SendAarCieCardReadingScreen}
        name={PN_ROUTES.SEND_AAR_CIE_CARD_READING}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={SendAarActivateNfcScreen}
        name={PN_ROUTES.SEND_AAR_NFC_ACTIVATION}
        options={{ presentation: "modal" }}
      />
    </Stack.Group>
  </Stack.Navigator>
);
