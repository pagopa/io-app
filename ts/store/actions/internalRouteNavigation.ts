import { ActionType, createStandardAction } from "typesafe-actions";

export const addInternalRouteNavigation = createStandardAction(
  "INTERNAL_ROUTE_NAVIGATION_ADD"
)<any>();

export const resetInternalRouteNavigation = createStandardAction(
  "INTERNAL_ROUTE_NAVIGATION_RESET"
)();

export type InternalRouteNavigationActions = ActionType<
  typeof addInternalRouteNavigation | typeof resetInternalRouteNavigation
>;
