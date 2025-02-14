import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { closeSessionExpirationBanner } from "../actions/sessionExpirationActions";

export type SessionExpirationState = {
  showSessionExpirationBanner: boolean;
};

const SESSION_EXPIRATION_INITIAL_STATE: SessionExpirationState = {
  showSessionExpirationBanner: true
};

// TODO: Probably this value should be persisted
export const sessionExpirationReducer = (
  state: SessionExpirationState = SESSION_EXPIRATION_INITIAL_STATE,
  action: Action
): SessionExpirationState => {
  switch (action.type) {
    case getType(closeSessionExpirationBanner):
      return {
        ...state,
        showSessionExpirationBanner: false
      };
    default:
      return state;
  }
};
