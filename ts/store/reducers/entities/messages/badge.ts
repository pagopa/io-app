/**
 * Badge reducer
 */
import { getType } from "typesafe-actions";
import { setNumberMessagesUnread } from "../../../actions/messages";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type BadgeNumberState = Readonly<{
  badgeCount: number;
}>;

export function getInitialState(): BadgeNumberState {
  return {
    badgeCount: 0
  };
}

const reducer = (
  state: BadgeNumberState = getInitialState(),
  action: Action
): BadgeNumberState => {
  switch (action.type) {
    case getType(setNumberMessagesUnread):
      return { ...state, badgeCount: action.payload };
    default:
      return state;
  }
};

export default reducer;

// Selector
export const badgeNumberSelector = (state: GlobalState) =>
  state.entities.messages.badge;
