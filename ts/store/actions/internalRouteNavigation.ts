import { ActionType, createStandardAction } from "typesafe-actions";
import { InternalRoute } from "../../components/ui/Markdown/handlers/internalLink";

export const addInternalRouteNavigation = createStandardAction(
  "INTERNAL_ROUTE_NAVIGATION_ADD"
)<InternalRoute>();

export const resetInternalRouteNavigation = createStandardAction(
  "INTERNAL_ROUTE_NAVIGATION_RESET"
)();

export type InternalRouteNavigationActions = ActionType<
  typeof addInternalRouteNavigation | typeof resetInternalRouteNavigation
>;
