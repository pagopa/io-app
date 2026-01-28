import { SendAARCieCardReadingScreenRouteParams } from "../aar/screen/SendAARCieCardReadingScreen";
import { SendEngagementScreenNavigationParams } from "../aar/screen/SendEngagementScreen";
import { SendQRScanFlowScreenProps } from "../aar/screen/SendQRScanFlowScreen";
import { MessageAttachmentScreenRouteParams } from "../screens/MessageAttachmentScreen";
import { MessageDetailsScreenRouteParams } from "../screens/MessageDetailsScreen";
import { PaidPaymentScreenRouteParams } from "../screens/PaidPaymentScreen";
import PN_ROUTES from "./routes";

export type PnParamsList = {
  [PN_ROUTES.MESSAGE_DETAILS]: MessageDetailsScreenRouteParams;
  [PN_ROUTES.MESSAGE_ATTACHMENT]: MessageAttachmentScreenRouteParams;
  [PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT]: PaidPaymentScreenRouteParams;
  // ENGAGEMENT BANNER
  [PN_ROUTES.ACTIVATION_BANNER_FLOW]: undefined;
  // QR SCAN
  [PN_ROUTES.QR_SCAN_FLOW]: SendQRScanFlowScreenProps;
  [PN_ROUTES.ENGAGEMENT_SCREEN]: SendEngagementScreenNavigationParams;
  // SEND ENGAGEMENT
  [PN_ROUTES.SEND_ENGAGEMENT_ON_FIRST_APP_OPENING]: undefined;
  [PN_ROUTES.SEND_ENGAGEMENT_ACTIVATION_ERROR]: undefined;
  [PN_ROUTES.SEND_AAR_ERROR]: undefined;
  [PN_ROUTES.SEND_AAR_DELEGATION_PROPOSAL]: undefined;
  [PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL]: undefined;
  [PN_ROUTES.SEND_AAR_CIE_CAN_INSERTION]: undefined;
  [PN_ROUTES.SEND_AAR_CIE_CARD_READING_EDUCATIONAL]: undefined;
  [PN_ROUTES.SEND_AAR_NFC_ACTIVATION]: undefined;
  [PN_ROUTES.SEND_AAR_CIE_CARD_READING]: SendAARCieCardReadingScreenRouteParams;
};
