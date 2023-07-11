import { Action, getType } from "typesafe-actions";
import {
  askUserToRefreshSessionToken,
  clearPendingAction,
  clearTokenTransientError,
  refreshSessionToken,
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
type TokenRefreshTransientErrorState = {
  kind: "transient-error";
};
type TokenRefreshSuccessState = {
  kind: "success";
  timestamp: number;
};
type TokenRefreshState =
  | TokenRefreshProgressState
  | TokenRefreshErrorState
  | TokenRefreshTransientErrorState
  | TokenRefreshSuccessState
  | TokenRefreshIdleState;

export type FastLoginState = {
  userInteractionForSessionExpiredNeeded: boolean;
  tokenRefresh: TokenRefreshState;
  pendingActions: Array<Action>;
};

const FastLoginInitialState: FastLoginState = {
  userInteractionForSessionExpiredNeeded: false,
  tokenRefresh: { kind: "idle" },
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
    case getType(refreshSessionToken.success):
      return {
        ...state,
        tokenRefresh: { kind: "success", timestamp: Date.now() }
      };
    case getType(refreshSessionToken.failure):
      return {
        ...state,
        tokenRefresh: { kind: "error" }
      };
    case getType(refreshTokenTransientError):
      return {
        ...state,
        tokenRefresh: { kind: "transient-error" }
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
