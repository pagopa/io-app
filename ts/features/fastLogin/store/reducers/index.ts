import { Action, getType } from "typesafe-actions";
import {
  askUserToRefreshSessionToken,
  clearPendingAction,
  clearTokenTransientError,
  hideRefreshTokenLoader,
  refreshTokenTransientError,
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

type TokenRefreshIdleState = {
  kind: "idle";
};
type TokenRefreshProgressState = {
  kind: "in-progress";
};
type TokenRefreshErrorState = {
  kind: "error";
};
type TokenRefreshSuccessState = {
  kind: "success";
};
type TokenRefreshState =
  | TokenRefreshProgressState
  | TokenRefreshErrorState
  | TokenRefreshSuccessState
  | TokenRefreshIdleState;

export type FastLoginState = {
  userInteractionForSessionExpiredNeeded: boolean;
  tokenRefresh: TokenRefreshState;
  pendingActions: Array<Action>;
};

const FastLoginInitialState: FastLoginState = {
  userInteractionForSessionExpiredNeeded: false,
  tokenRefresh: { kind: "success" },
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
        tokenRefresh: { kind: "in-progress" }
      };
    case getType(hideRefreshTokenLoader):
      return {
        ...state,
        tokenRefresh: { kind: "success" }
      };
    case getType(refreshTokenTransientError):
      return {
        ...state,
        tokenRefresh: { kind: "error" }
      };
    case getType(clearTokenTransientError):
      return {
        ...state,
        tokenRefresh: { kind: "idle" }
      };
    default:
      return state;
  }
};
