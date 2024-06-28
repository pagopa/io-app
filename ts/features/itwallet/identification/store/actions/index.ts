import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { SessionToken } from "../../../../../types/SessionToken";
import { IdpData } from "../../../../../../definitions/content/IdpData";

export const itwNfcIsEnabled = createAsyncAction(
  "ITW_NFC_IS_ENABLED_REQUEST",
  "ITW_NFC_IS_ENABLED_SUCCESS",
  "ITW_NFC_IS_ENABLED_FAILURE"
)<void, boolean, Error>();

export const itwLoginSuccess = createStandardAction("ITW_LOGIN_SUCCESS")<{
  token: SessionToken;
  idp: keyof IdpData;
}>();

export const itwLoginFailure = createStandardAction("ITW_LOGIN_FAILURE")<{
  error: Error;
  idp: keyof IdpData | undefined;
}>();

export type ItwIdentificationActions =
  | ActionType<typeof itwNfcIsEnabled>
  | ActionType<typeof itwLoginSuccess>
  | ActionType<typeof itwLoginFailure>;
