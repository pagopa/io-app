import { FimsWebviewScreenNavigationParams } from "../screens/FimsWebviewScreen";
import FIMS_ROUTES from "./routes";

export type FimsParamsList = {
  [FIMS_ROUTES.MAIN]: undefined;
  [FIMS_ROUTES.WEBVIEW]: FimsWebviewScreenNavigationParams;
};
