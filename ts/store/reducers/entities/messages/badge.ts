/**
 * Badge reducer
 */
import { getType } from "typesafe-actions";
import { setNumberMessagesUnread } from "../../../actions/messages";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type BadgeNumberState = {
  count: number;
};

export function getInitialState(): BadgeNumberState {
  return {
    count: 0
  };
}

const badgeReducer = (
  state: BadgeNumberState = getInitialState(),
  action: Action
): BadgeNumberState => {
  switch (action.type) {
    case getType(setNumberMessagesUnread):
      return { ...state, count: action.payload };
    default:
      return state;
  }
};

export const badgeSelector = (state: GlobalState) =>
  state.entities.messages.badge.count;

export default badgeReducer;
