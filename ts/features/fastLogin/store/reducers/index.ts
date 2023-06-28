import { Action, getType } from "typesafe-actions";
import {
  askUserToRefreshSessionToken,
  clearPendingAction,
  hideRefreshTokenLoader,
  savePendingAction,
  showRefreshTokenLoader
} from "../actions";

type FastLoginUserInteractionChoiceNone = {
  type: "none";
};
type FastLoginUserInteractionChoiceAccept = {
  type: "accepted";
  timestamp: number;
};
type FastLoginUserInteractionChoiceDecline = {
  type: "declined";
  timestamp: number;
};
export type FastLoginUserInteractionChoice =
  | FastLoginUserInteractionChoiceAccept
  | FastLoginUserInteractionChoiceDecline
  | FastLoginUserInteractionChoiceNone;

export type FastLoginState = {
  userInteractionForSessionExpiredNeeded: boolean;
  showLoading: boolean;
  pendingActions: Array<Action>;
};

const FastLoginInitialState: FastLoginState = {
  userInteractionForSessionExpiredNeeded: false,
  showLoading: false,
  pendingActions: []
};

export const fastLoginReducer = (
  state: FastLoginState = FastLoginInitialState,
  action: Action
): FastLoginState => {
  switch (action.type) {
    case getType(clearPendingAction):
      return {
        ...state,
        pendingActions: []
      };
    case getType(savePendingAction):
      const actionToSave = action as ReturnType<typeof savePendingAction>;
      return {
        ...state,
        pendingActions: [
          ...state.pendingActions,
          actionToSave.payload.pendingAction
        ]
      };
    case getType(askUserToRefreshSessionToken.request):
      return {
        ...state,
        userInteractionForSessionExpiredNeeded: true
      };
    case getType(askUserToRefreshSessionToken.success):
      return {
        ...state,
        userInteractionForSessionExpiredNeeded: false
      };
    case getType(showRefreshTokenLoader):
      return {
        ...state,
        showLoading: true
      };
    case getType(hideRefreshTokenLoader):
      return {
        ...state,
        showLoading: false
      };
    default:
      return state;
  }
};
