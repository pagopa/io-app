/**
 * Action types and action creator related to the Profile.
 */

import { Option } from "fp-ts/lib/Option";
import { Omit } from "italia-ts-commons/lib/types";
import {
  ActionType,
  createAction,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { ExtendedProfile } from "../../../definitions/backend/ExtendedProfile";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";

export const resetProfileState = createStandardAction("RESET_PROFILE_STATE")();

export const profileLoadRequest = createStandardAction(
  "PROFILE_LOAD_REQUEST"
)();
export const profileLoadSuccess = createStandardAction("PROFILE_LOAD_SUCCESS")<
  InitializedProfile
>();

export const profileLoadFailure = createAction(
  "PROFILE_LOAD_FAILURE",
  resolve => (error: Error) => resolve(error, { error: true })
);

type ProfileUpsertPayload = Partial<Omit<InitializedProfile, "version">>;

export const profileUpsert = createAsyncAction(
  "PROFILE_UPSERT_REQUEST",
  "PROFILE_UPSERT_SUCCESS",
  "PROFILE_UPSERT_FAILURE"
)<ProfileUpsertPayload, InitializedProfile, Error>();

export const startEmailValidation = createAsyncAction(
  "START_EMAIL_VALIDATION_REQUEST",
  "START_EMAIL_VALIDATION_SUCCESS",
  "START_EMAIL_VALIDATION_FAILURE"
)<void, void, Error>();

export const acknowledgeOnEmailValidation = createStandardAction(
  "ACKNOWLEDGE_ON_EMAIL_VALIDATION"
)<Option<boolean>>();

export const profileFirstLogin = createStandardAction("PROFILE_FIRST_LOGIN")();

export const clearCache = createStandardAction("CLEAR_CACHE")();

export type ProfileActions =
  | ActionType<typeof resetProfileState>
  | ActionType<typeof profileLoadSuccess>
  | ActionType<typeof profileLoadRequest>
  | ActionType<typeof profileLoadFailure>
  | ActionType<typeof profileUpsert>
  | ActionType<typeof startEmailValidation>
  | ActionType<typeof acknowledgeOnEmailValidation>
  | ActionType<typeof profileFirstLogin>
  | ActionType<typeof clearCache>;
