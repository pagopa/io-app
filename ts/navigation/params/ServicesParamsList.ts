import { ServiceDetailsScreenNavigationParams } from "../../screens/services/ServiceDetailsScreen";
import { ServiceWebviewScreenNavigationParams } from "../../screens/services/ServicesWebviewScreen";
import ROUTES from "../routes";

export type ServicesParamsList = {
  [ROUTES.SERVICE_DETAIL]: ServiceDetailsScreenNavigationParams;
  [ROUTES.SERVICE_WEBVIEW]: ServiceWebviewScreenNavigationParams;
};
