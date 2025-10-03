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
  [PN_ROUTES.ENGAGEMENT_SCREEN]: undefined;
  [PN_ROUTES.QR_SCAN_PUSH_ENGAGEMENT]: undefined;
  [PN_ROUTES.SEND_AAR_ERROR]: undefined;
};
