import { NavigatorScreenParams } from "@react-navigation/native";

import { PnParamsList } from "../../pn/navigation/params";
import PN_ROUTES from "../../pn/navigation/routes";
import { MessageDetailsScreenRouteParams as SendMessageDetailsScreenRouteParams } from "../../pn/screens/MessageDetailsScreen";
import { MessageAttachmentScreenRouteParams } from "../screens/MessageAttachmentScreen";
import { MessageCalendarScreenRouteParams } from "../screens/MessageCalendarScreen";
import { MessageDetailsScreenRouteParams } from "../screens/MessageDetailsScreen";
import { MessageGreenPassScreenRouteParams } from "../screens/MessageGreenPassScreen";
import { MessageRouterScreenRouteParams } from "../screens/MessageRouterScreen";
import { MESSAGES_ROUTES } from "./routes";

export type MessageContentParamsList = {
  [MESSAGES_ROUTES.MESSAGE_DETAIL]: MessageDetailsScreenRouteParams;
  [MESSAGES_ROUTES.MESSAGE_GREEN_PASS]: MessageGreenPassScreenRouteParams;
  [PN_ROUTES.MESSAGE_DETAILS]: SendMessageDetailsScreenRouteParams;
};

export type MessagesParamsList = {
  [MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT]: MessageAttachmentScreenRouteParams;
  [MESSAGES_ROUTES.MESSAGE_DETAIL_CALENDAR]: MessageCalendarScreenRouteParams;
  [MESSAGES_ROUTES.MESSAGE_ROUTER]: MessageRouterScreenRouteParams;
  [PN_ROUTES.MAIN]: NavigatorScreenParams<PnParamsList>;
};
