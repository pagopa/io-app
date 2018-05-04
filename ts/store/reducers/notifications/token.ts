import { none, Option, some } from "fp-ts/lib/Option";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../../reducers/types";
import { NOTIFICATIONS_TOKEN_UPDATE } from "../../actions/constants";

export type TokenState = Option<string>;

export const INITIAL_STATE: TokenState = none;

const reducer = (
  state: TokenState = INITIAL_STATE,
  action: Action
): TokenState => {
  switch (action.type) {
    case NOTIFICATIONS_TOKEN_UPDATE:
      return some(action.payload);
    default:
      return state;
  }
};

// Selectors
export const notificationsTokenSelector = (state: GlobalState) => {
  return state.notifications.token;
};

export default reducer;
