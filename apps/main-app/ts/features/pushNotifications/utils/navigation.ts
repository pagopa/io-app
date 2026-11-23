import { CommonActions } from "@react-navigation/native";

import { MESSAGES_ROUTES } from "../../messages/navigation/routes";
import { MessageRouterScreenRouteParams } from "../../messages/screens/MessageRouterScreen";

/**
 * Open a new Messages navigator containing only the Message Router screen. This
 * replaces any existing navigation state within the Messages navigator, thus
 * avoiding edge cases where the previous message's state would interfere with
 * the new one.
 */
export const navigateToMessageRouterAction = (
  params: MessageRouterScreenRouteParams
) =>
  CommonActions.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
    state: {
      routes: [{ name: MESSAGES_ROUTES.MESSAGE_ROUTER, params }]
    }
  });
