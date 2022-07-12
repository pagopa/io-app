import { PnAttachmentPreviewNavigationParams } from "../screens/PnAttachmentPreview";
import { PnMessageDetailsScreenNavigationParams } from "../screens/PnMessageDetailsScreen";
import PN_ROUTES from "./routes";

export type PnParamsList = {
  [PN_ROUTES.MESSAGE_DETAILS]: PnMessageDetailsScreenNavigationParams;
  [PN_ROUTES.MESSAGE_ATTACHMENT]: PnAttachmentPreviewNavigationParams;
};
