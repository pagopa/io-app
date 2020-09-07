import { getType } from "typesafe-actions";
import { InternalRoute } from "../../components/ui/Markdown/handlers/internalLink";
import { Action } from "../actions/types";
import { addInternalRouteNavigation } from "../actions/internalRoutNavigation";
import { GlobalState } from "./types";

export type InternalRouteNavigationState = InternalRoute | null;

const initialInternalRouteNavigationState = null;

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

export default reducer;
