import { MessageAttachmentScreenRouteParams } from "../screens/MessageAttachmentScreen";
import { MessageDetailsScreenRouteParams } from "../screens/MessageDetailsScreen";
import { PaidPaymentScreenRouteParams } from "../screens/PaidPaymentScreen";
import PN_ROUTES from "./routes";

export type PnParamsList = {
  [PN_ROUTES.MESSAGE_DETAILS]: MessageDetailsScreenRouteParams;
  [PN_ROUTES.MESSAGE_ATTACHMENT]: MessageAttachmentScreenRouteParams;
  [PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT]: PaidPaymentScreenRouteParams;
  [PN_ROUTES.ACTIVATION_BANNER_FLOW]: undefined;
};
