import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { SessionToken } from "../../../../../types/SessionToken";
import { isDevEnv } from "../../../../../utils/environment";

type PendingActionPayload = { pendingAction: Action };
export const savePendingAction = createStandardAction(
  "SAVE_PENDING_ACTION"
)<PendingActionPayload>();

export const clearPendingAction = createStandardAction(
  "CLEAR_PENDING_ACTION"
)<void>();

export const showRefreshTokenLoader = createStandardAction(
  "SHOW_REFRESHING_TOKEN_LOADER"
)<void>();

export const refreshTokenTransientError = createStandardAction(
  "REFRESHING_TOKEN_TRANSIENT_ERROR"
)<void>();

export const refreshTokenNoPinError = createStandardAction(
  "REFRESHING_TOKEN_NO_PIN_ERROR"
)<void>();

export const clearTokenRefreshError = createStandardAction(
  "CLEAR_TOKEN_REFRESH_ERROR"
)<void>();

type RefreshSessionTokenRequestPayload = {
  withUserInteraction: boolean;
  showIdentificationModalAtStartup: boolean;
  showLoader: boolean;
};
export const refreshSessionToken = createAsyncAction(
  "REFRESH_SESSION_TOKEN_REQUEST",
  "REFRESH_SESSION_TOKEN_SUCCESS",
  "REFRESH_SESSION_TOKEN_FAILURE"
)<RefreshSessionTokenRequestPayload, SessionToken, Error>();

type SessionTokenRefreshChoice = "yes" | "no";
export const askUserToRefreshSessionToken = createAsyncAction(
  "ASK_USER_TO_REFRESH_SESSION_TOKEN_REQUEST",
  "ASK_USER_TO_REFRESH_SESSION_TOKEN_SUCCESS",
  "ASK_USER_TO_REFRESH_SESSION_TOKEN_FAILURE"
)<void, SessionTokenRefreshChoice, Error>();

type PendingActionTypes = typeof savePendingAction | typeof clearPendingAction;

export type FastLoginTokenRefreshActions =
  | ActionType<typeof clearTokenRefreshError>
  | ActionType<PendingActionTypes>
  | ActionType<typeof refreshSessionToken>
  | ActionType<typeof askUserToRefreshSessionToken>;

export const testable = isDevEnv
  ? {
      types: {
        RefreshSessionTokenRequestPayload:
          {} as RefreshSessionTokenRequestPayload
      }
    }
  : undefined;
