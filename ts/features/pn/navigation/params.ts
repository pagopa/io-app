import { AttachmentPreviewScreenNavigationParams } from "../screens/AttachmentPreviewScreen";
import { MessageDetailsScreenNavigationParams } from "../screens/MessageDetailsScreen";
import { PaidPaymentScreenNavigationParams } from "../screens/PaidPaymentScreen";
import PN_ROUTES from "./routes";

export type PnParamsList = {
  [PN_ROUTES.MESSAGE_DETAILS]: MessageDetailsScreenNavigationParams;
  [PN_ROUTES.MESSAGE_ATTACHMENT]: AttachmentPreviewScreenNavigationParams;
  [PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT]: PaidPaymentScreenNavigationParams;
};
