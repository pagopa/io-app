import { Action, getType } from "typesafe-actions";

import { isDevEnv } from "../../../../../utils/environment";
import {
  askUserToRefreshSessionToken,
  clearPendingAction,
  clearTokenRefreshError,
  refreshSessionToken,
  refreshTokenNoPinError,
  refreshTokenTransientError,
  savePendingAction,
  showRefreshTokenLoader
} from "../actions/tokenRefreshActions";

export type FastLoginTokenRefreshState = {
  pendingActions: Array<Action>;
  tokenRefresh: TokenRefreshState;
  userInteractionForSessionExpiredNeeded: boolean;
};
export type FastLoginUserInteractionChoice =
  | FastLoginUserInteractionChoiceAccept
  | FastLoginUserInteractionChoiceDecline
  | FastLoginUserInteractionChoiceNone;
export type TokenRefreshState =
  | TokenRefreshErrorState
  | TokenRefreshIdleState
  | TokenRefreshNoPinErrorState
  | TokenRefreshProgressState
  | TokenRefreshSuccessState
  | TokenRefreshTransientErrorState;
type FastLoginUserInteractionChoiceAccept = {
  timestamp: number;
  type: "accepted";
};

type FastLoginUserInteractionChoiceDecline = {
  timestamp: number;
  type: "declined";
};
type FastLoginUserInteractionChoiceNone = {
  type: "none";
};
type TokenRefreshErrorState = {
  kind: "error";
};
type TokenRefreshIdleState = {
  kind: "idle";
};

type TokenRefreshNoPinErrorState = {
  kind: "no-pin-error";
};

type TokenRefreshProgressState = {
  kind: "in-progress";
};
type TokenRefreshSuccessState = {
  kind: "success";
  timestamp: number;
};

type TokenRefreshTransientErrorState = {
  kind: "transient-error";
};

const FastLoginTokenRefreshHandlerInitialState: FastLoginTokenRefreshState = {
  userInteractionForSessionExpiredNeeded: false,
  tokenRefresh: { kind: "idle" },
  pendingActions: []
};

export const FastLoginTokenRefreshReducer = (
  state: FastLoginTokenRefreshState = FastLoginTokenRefreshHandlerInitialState,
  action: Action
): FastLoginTokenRefreshState => {
  switch (action.type) {
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
    case getType(clearPendingAction):
      return {
        ...state,
        pendingActions: []
      };
    case getType(clearTokenRefreshError):
      return {
        ...state,
        tokenRefresh: { kind: "idle" }
      };
    case getType(refreshSessionToken.failure):
      return {
        ...state,
        tokenRefresh: { kind: "error" }
      };
    case getType(refreshSessionToken.success):
      return {
        ...state,
        tokenRefresh: { kind: "success", timestamp: Date.now() }
      };
    case getType(refreshTokenNoPinError):
      return {
        ...state,
        tokenRefresh: { kind: "no-pin-error" }
      };
    case getType(refreshTokenTransientError):
      return {
        ...state,
        tokenRefresh: { kind: "transient-error" }
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
    case getType(showRefreshTokenLoader):
      return {
        ...state,
        tokenRefresh: { kind: "in-progress" }
      };
    default:
      return state;
  }
};

export const testableFastLoginTokenRefreshReducer = isDevEnv
  ? {
      FastLoginTokenRefreshHandlerInitialState
    }
  : undefined;
