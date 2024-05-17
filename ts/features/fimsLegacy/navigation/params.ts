import { FimsWebviewScreenNavigationParams } from "../screens/FimsWebviewScreen";
import FIMS_LEGACY_ROUTES from "./routes";

export type FimsLegacyParamsList = {
  [FIMS_LEGACY_ROUTES.MAIN]: undefined;
  [FIMS_LEGACY_ROUTES.WEBVIEW]: FimsWebviewScreenNavigationParams;
};
