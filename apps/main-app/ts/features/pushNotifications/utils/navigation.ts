import { CommonActions } from "@react-navigation/native";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes";
import { MessageRouterScreenRouteParams } from "../../messages/screens/MessageRouterScreen";

/**
 * Open the Message Detail Router supporting the new UIMessage type.
 */
export const navigateToMessageRouterAction = (
  params: MessageRouterScreenRouteParams
) =>
  CommonActions.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
    screen: MESSAGES_ROUTES.MESSAGE_ROUTER,
    params
  });
