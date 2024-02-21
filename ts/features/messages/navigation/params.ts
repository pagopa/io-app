import { NavigatorScreenParams } from "@react-navigation/native";
import EUCOVIDCERT_ROUTES from "../../euCovidCert/navigation/routes";
import PN_ROUTES from "../../pn/navigation/routes";
import { MessageRouterScreenNavigationParams } from "../screens/MessageRouterScreen";
import { MessageDetailsScreenNavigationParams } from "../screens/MessageDetailsScreen";
import { EUCovidCertParamsList } from "../../euCovidCert/navigation/params";
import { PnParamsList } from "../../pn/navigation/params";
import { MessageAttachmentNavigationParams } from "../screens/MessageAttachment";
import { MessageCalendarRouteParams } from "../screens/MessageCalendarScreen";
import { MESSAGES_ROUTES } from "./routes";

export type MessagesParamsList = {
  [MESSAGES_ROUTES.MESSAGE_ROUTER]: MessageRouterScreenNavigationParams;
  [MESSAGES_ROUTES.MESSAGE_DETAIL]: MessageDetailsScreenNavigationParams;
  [MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT]: MessageAttachmentNavigationParams;
  [MESSAGES_ROUTES.MESSAGE_DETAIL_CALENDAR]: MessageCalendarRouteParams;
  [EUCOVIDCERT_ROUTES.MAIN]: NavigatorScreenParams<EUCovidCertParamsList>;
  [PN_ROUTES.MAIN]: NavigatorScreenParams<PnParamsList>;
};
