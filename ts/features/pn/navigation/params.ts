import { AttachmentPreviewScreenNavigationParams } from "../screens/AttachmentPreviewScreen";
import { PnMessageDetailsScreenNavigationParams } from "../screens/PnMessageDetailsScreen";
import { PnPaidPaymentScreenNavigationParams } from "../screens/PnPaidPaymentScreen";
import PN_ROUTES from "./routes";

export type PnParamsList = {
  [PN_ROUTES.MESSAGE_DETAILS]: PnMessageDetailsScreenNavigationParams;
  [PN_ROUTES.MESSAGE_ATTACHMENT]: AttachmentPreviewScreenNavigationParams;
  [PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT]: PnPaidPaymentScreenNavigationParams;
};
