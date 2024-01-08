import { CommonActions } from "@react-navigation/native";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { MessageDetailScreenNavigationParams } from "../../screens/MessageDetailScreen";
import { MessageRouterScreenNavigationParams } from "../../screens/MessageRouterScreen";

/**
 * Open the Message Detail screen supporting the new UIMessage type.
 */
export const navigateToMessageDetailScreenAction = (
  params: MessageDetailScreenNavigationParams
) =>
  CommonActions.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
    screen: MESSAGES_ROUTES.MESSAGE_DETAIL,
    params
  });

/**
 * Open the Message Detail Router supporting the new UIMessage type.
 */
export const navigateToMessageRouterAction = (
  params: MessageRouterScreenNavigationParams
) =>
  CommonActions.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
    screen: MESSAGES_ROUTES.MESSAGE_ROUTER,
    params
  });
