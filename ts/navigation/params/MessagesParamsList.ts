import { NavigatorScreenParams } from "@react-navigation/native";
import { EUCovidCertParamsList } from "../../features/euCovidCert/navigation/params";
import EUCOVIDCERT_ROUTES from "../../features/euCovidCert/navigation/routes";
import { MvlParamsList } from "../../features/mvl/navigation/params";
import MVL_ROUTES from "../../features/mvl/navigation/routes";
import { PnParamsList } from "../../features/pn/navigation/params";
import PN_ROUTES from "../../features/pn/navigation/routes";
import { MessageDetailScreenPaginatedNavigationParams } from "../../screens/messages/paginated/MessageDetailScreen";
import { MessageRouterScreenPaginatedNavigationParams } from "../../screens/messages/paginated/MessageRouterScreen";
import ROUTES from "../routes";

export type MessagesParamsList = {
  [ROUTES.MESSAGE_ROUTER_PAGINATED]: MessageRouterScreenPaginatedNavigationParams;
  [ROUTES.MESSAGE_DETAIL_PAGINATED]: MessageDetailScreenPaginatedNavigationParams;
  [EUCOVIDCERT_ROUTES.MAIN]: NavigatorScreenParams<EUCovidCertParamsList>;
  [MVL_ROUTES.MAIN]: NavigatorScreenParams<MvlParamsList>;
  [PN_ROUTES.MAIN]: NavigatorScreenParams<PnParamsList>;
};
