import * as pot from "@pagopa/ts-commons/lib/pot";
import { ActionType, createStandardAction } from "typesafe-actions";

import { ErrorType } from "../types";

export const setSpidLoginRequestState = createStandardAction(
  "SET_SPID_LOGIN_REQUEST_STATE"
)<pot.Pot<true, ErrorType>>();
export const setSpidLoginInLoadingState = createStandardAction(
  "SET_SPID_LOGIN_IN_LOADING_STATE"
)();
export const resetSpidLoginState = createStandardAction("RESET_LOGIN_STATE")();

export type SpidConfigActions =
  | ActionType<typeof resetSpidLoginState>
  | ActionType<typeof setSpidLoginInLoadingState>
  | ActionType<typeof setSpidLoginRequestState>;
