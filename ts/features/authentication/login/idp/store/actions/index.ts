import { ActionType, createStandardAction } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ErrorType, NativeLoginRequestInfo } from "../types";

export const setNativeLoginRequestInfo = createStandardAction(
  "SET_NATIVE_LOGIN_REQUEST_INFO"
)<NativeLoginRequestInfo>();
export const incrementNativeLoginNativeAttempts = createStandardAction(
  "INCREMENT_NATIVE_LOGIN_NATIVE_ATTEMPTS"
)();
export const setStandardLoginRequestState = createStandardAction(
  "SET_STNDARD_LOGIN_REQUEST_STATE"
)<pot.Pot<true, ErrorType>>();
export const setStandardLoginInLoadingState = createStandardAction(
  "SET_STANDARD_LOGIN_IN_LOADING_STATE"
)();
export const resetSpidLoginState = createStandardAction("RESET_LOGIN_STATE")();

export type SpidConfigActions =
  | ActionType<typeof setNativeLoginRequestInfo>
  | ActionType<typeof incrementNativeLoginNativeAttempts>
  | ActionType<typeof setStandardLoginRequestState>
  | ActionType<typeof setStandardLoginInLoadingState>
  | ActionType<typeof resetSpidLoginState>;
