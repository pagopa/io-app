import { StackNavigationOptions } from "@react-navigation/stack";
import { SendAARCieCardReadingScreenRouteParams } from "../aar/screen/SendAARCieCardReadingScreen";
import { SendEngagementScreenNavigationParams } from "../aar/screen/SendEngagementScreen";
import { SendQRScanFlowScreenProps } from "../aar/screen/SendQRScanFlowScreen";
import { MessageAttachmentScreenRouteParams } from "../screens/MessageAttachmentScreen";
import { MessageDetailsScreenRouteParams } from "../screens/MessageDetailsScreen";
import { PaidPaymentScreenRouteParams } from "../screens/PaidPaymentScreen";
import PN_ROUTES from "./routes";

type AnimationParamType =
  | Pick<StackNavigationOptions, "animationTypeForReplace">
  | undefined;
export type PnParamsList = {
  [PN_ROUTES.MESSAGE_DETAILS]: MessageDetailsScreenRouteParams;
  [PN_ROUTES.MESSAGE_ATTACHMENT]: MessageAttachmentScreenRouteParams;
  [PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT]: PaidPaymentScreenRouteParams;
  // ENGAGEMENT BANNER
  [PN_ROUTES.ACTIVATION_BANNER_FLOW]: undefined;
  // SEND ENGAGEMENT
  [PN_ROUTES.ENGAGEMENT_SCREEN]: SendEngagementScreenNavigationParams;
  [PN_ROUTES.SEND_ENGAGEMENT_ON_FIRST_APP_OPENING]: undefined;
  [PN_ROUTES.SEND_ENGAGEMENT_ACTIVATION_ERROR]: undefined;
  // SEND AAR FLOW
  [PN_ROUTES.QR_SCAN_FLOW]: SendQRScanFlowScreenProps;
  [PN_ROUTES.SEND_AAR_ERROR]: undefined;
  [PN_ROUTES.SEND_AAR_DELEGATION_PROPOSAL]: undefined;
  [PN_ROUTES.SEND_AAR_NFC_ACTIVATION]: undefined;
  [PN_ROUTES.SEND_AAR_CIE_CARD_READING_EDUCATIONAL]: AnimationParamType;
  [PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL]: AnimationParamType;
  [PN_ROUTES.SEND_AAR_CIE_CAN_INSERTION]: AnimationParamType;
  [PN_ROUTES.SEND_AAR_CIE_CARD_READING]: SendAARCieCardReadingScreenRouteParams &
    AnimationParamType;
};
