import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { InternalRoute } from "../../components/ui/Markdown/handlers/internalLink";
import { Action } from "../actions/types";
import { addInternalRouteNavigation } from "../actions/internalRouteNavigation";
import { GlobalState } from "./types";

export type InternalRouteNavigationState = InternalRoute;

const initialInternalRouteNavigationState = {
  routeName: ""
};

const reducer = (
  state: InternalRouteNavigationState = initialInternalRouteNavigationState,
  action: Action
): InternalRouteNavigationState => {
  if (action.type === getType(addInternalRouteNavigation)) {
    return action.payload;
  }
  return state;
};

export const internalRouteNavigationSelector = (
  state: GlobalState
): InternalRouteNavigationState => state.internalRouteNavigation;

export const internalRouteNavigationParamsSelector = createSelector(
  internalRouteNavigationSelector,
  irn => irn.params
);

export default reducer;
