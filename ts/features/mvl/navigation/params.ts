import { MvlRouterScreenNavigationParams } from "../screens/MvlRouterScreen";
import { MvlAttachmentPreviewNavigationParams } from "../screens/details/components/attachment/MvlAttachmentPreview";
import MVL_ROUTES from "./routes";

export type MvlParamsList = {
  [MVL_ROUTES.DETAILS]: MvlRouterScreenNavigationParams;
  [MVL_ROUTES.CERTIFICATES]: undefined;
  [MVL_ROUTES.RECIPIENTS]: undefined;
  [MVL_ROUTES.SIGNATURE]: undefined;
  [MVL_ROUTES.ATTACHMENT]: MvlAttachmentPreviewNavigationParams;
};
