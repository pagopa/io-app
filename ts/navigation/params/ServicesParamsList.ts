import {
  SvVoucherGenerationNavigatorParamsList,
  SvVoucherListNavigatorParamsList
} from "../../features/bonus/siciliaVola/navigation/params";
import { ServiceDetailsScreenNavigationParams } from "../../screens/services/ServiceDetailsScreen";
import ROUTES from "../routes";

export type ServicesParamsList = {
  [ROUTES.SERVICE_DETAIL]: ServiceDetailsScreenNavigationParams;
  [ROUTES.SERVICE_WEBVIEW]: undefined;
} & SvVoucherGenerationNavigatorParamsList &
  SvVoucherListNavigatorParamsList;
