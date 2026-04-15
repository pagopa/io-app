import { ActionType, createStandardAction } from "typesafe-actions";
import { FastLoginOptInState } from "../reducers/optInReducer";

export const setFastLoginOptIn = createStandardAction(
  "SET_FAST_LOGIN_OPTIN"
)<FastLoginOptInState>();

export type fastLoginOptInActions = ActionType<typeof setFastLoginOptIn>;
