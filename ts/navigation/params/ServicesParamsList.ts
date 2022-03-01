import { ServiceDetailsScreenNavigationParams } from "../../screens/services/ServiceDetailsScreen";
import ROUTES from "../routes";

export type ServicesParamsList = {
  [ROUTES.SERVICES_HOME]: undefined;
  [ROUTES.SERVICE_DETAIL]: ServiceDetailsScreenNavigationParams;
  [ROUTES.SERVICE_WEBVIEW]: undefined;
};
