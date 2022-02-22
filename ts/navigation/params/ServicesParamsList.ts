import { ServiceDetailsScreenNavigationParams } from "../../screens/services/ServiceDetailsScreen";
import ROUTES from "../routes";

export type ServicesParamsList = {
  [ROUTES.SERVICE_DETAIL]: ServiceDetailsScreenNavigationParams;
  [ROUTES.SERVICE_WEBVIEW]: undefined;
};
