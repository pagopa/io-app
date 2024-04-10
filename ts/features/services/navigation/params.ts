import { ServiceDetailsScreenNavigationParams } from "../screens/ServiceDetailsScreen";
import { ServiceWebviewScreenNavigationParams } from "../../../screens/services/ServicesWebviewScreen";
import { SERVICES_ROUTES } from "./routes";

export type ServicesParamsList = {
  [SERVICES_ROUTES.SERVICE_DETAIL]: ServiceDetailsScreenNavigationParams;
  [SERVICES_ROUTES.SERVICE_WEBVIEW]: ServiceWebviewScreenNavigationParams;
};
