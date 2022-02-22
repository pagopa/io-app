import { MessageDetailScreenNavigationParams } from "../../screens/messages/MessageDetailScreen";
import { MessageRouterScreenNavigationParams } from "../../screens/messages/MessageRouterScreen";
import { MessageDetailScreenPaginatedNavigationParams } from "../../screens/messages/paginated/MessageDetailScreen";
import { MessageRouterScreenPaginatedNavigationParams } from "../../screens/messages/paginated/MessageRouterScreen";
import ROUTES from "../routes";

export type MessagesParamsList = {
  [ROUTES.MESSAGES_HOME]: undefined;
  [ROUTES.MESSAGE_ROUTER]: MessageRouterScreenNavigationParams;
  [ROUTES.MESSAGE_DETAIL]: MessageDetailScreenNavigationParams;
  [ROUTES.MESSAGE_ROUTER_PAGINATED]: MessageRouterScreenPaginatedNavigationParams;
  [ROUTES.MESSAGE_DETAIL_PAGINATED]: MessageDetailScreenPaginatedNavigationParams;
};
