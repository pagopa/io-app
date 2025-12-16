import { NavigatorScreenParams } from "@react-navigation/native";
import PN_ROUTES from "../../pn/navigation/routes";
import { MessageRouterScreenRouteParams } from "../screens/MessageRouterScreen";
import { MessageDetailsScreenRouteParams } from "../screens/MessageDetailsScreen";
import { PnParamsList } from "../../pn/navigation/params";
import { MessageAttachmentScreenRouteParams } from "../screens/MessageAttachmentScreen";
import { MessageCalendarScreenRouteParams } from "../screens/MessageCalendarScreen";
import { MESSAGES_ROUTES } from "./routes";

export type MessagesParamsList = {
  [MESSAGES_ROUTES.MESSAGE_ROUTER]: MessageRouterScreenRouteParams;
  [MESSAGES_ROUTES.MESSAGE_DETAIL]: MessageDetailsScreenRouteParams;
  [MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT]: MessageAttachmentScreenRouteParams;
  [MESSAGES_ROUTES.MESSAGE_DETAIL_CALENDAR]: MessageCalendarScreenRouteParams;
  [MESSAGES_ROUTES.MESSAGE_GREEN_PASS]: undefined;
  [PN_ROUTES.MAIN]: NavigatorScreenParams<PnParamsList>;
};
