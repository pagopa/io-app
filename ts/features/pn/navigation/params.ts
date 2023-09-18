import { PnAttachmentPreviewNavigationParams } from "../screens/PnAttachmentPreview";
import { PnMessageDetailsScreenNavigationParams } from "../screens/PnMessageDetailsScreen";
import { PnPaidPaymentScreenNavigationParams } from "../screens/PnPaidPaymentScreen";
import PN_ROUTES from "./routes";

export type PnParamsList = {
  [PN_ROUTES.MESSAGE_DETAILS]: PnMessageDetailsScreenNavigationParams;
  [PN_ROUTES.MESSAGE_ATTACHMENT]: PnAttachmentPreviewNavigationParams;
  [PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT]: PnPaidPaymentScreenNavigationParams;
};
