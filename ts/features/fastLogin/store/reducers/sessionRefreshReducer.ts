import { getType } from "typesafe-actions";
import { areTwoMinElapsedFromLastActivity } from "../actions/sessionRefreshActions";
import { Action } from "../../../../store/actions/types";
import {
  logoutFailure,
  logoutSuccess
} from "../../../../store/actions/authentication";

export type AutomaticSessionRefreshState = {
  areAlreadyTwoMinAfterLastActivity: boolean;
};

export const automaticSessionRefreshInitialState: AutomaticSessionRefreshState =
  {
    areAlreadyTwoMinAfterLastActivity: false
  };

export const AutomaticSessionRefreshReducer = (
  state: AutomaticSessionRefreshState = automaticSessionRefreshInitialState,
  action: Action
): AutomaticSessionRefreshState => {
  switch (action.type) {
    case getType(logoutSuccess):
    case getType(logoutFailure):
      return automaticSessionRefreshInitialState;
    case getType(areTwoMinElapsedFromLastActivity):
      return {
        ...state,
        areAlreadyTwoMinAfterLastActivity: action.payload.hasTwoMinPassed
      };
    default:
      return state;
  }
};
