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

// This action is needed because we want to show an alert if a user has some active bonus
// and he wants to delete his account.
// In this case ,if the bonuses data are not loaded yet, we use this action to
// start a saga and request the bonus information.
export const loadBonusBeforeRemoveAccount = createStandardAction(
  "LOAD_BONUS_BEFORE_REMOVE_ACCOUNT"
)<void>();

export enum RemoveAccountMotivationEnum {
  "UNDEFINED" = "undefined",
  "NOT_UTILS" = "notUtils",
  "NOT_SAFE" = "notSafe",
  "NEVER_USED" = "neverUsed",
  "OTHERS" = "others"
}

export type RemoveAccountMotivationPayload = {
  reason: RemoveAccountMotivationEnum;
  userText?: string;
};
export const removeAccountMotivation = createStandardAction(
  "REMOVE_ACCOUNT_MOTIVATION"
)<RemoveAccountMotivationPayload>();

export type ProfileActions =
  | ActionType<typeof resetProfileState>
  | ActionType<typeof profileLoadSuccess>
  | ActionType<typeof profileLoadRequest>
  | ActionType<typeof profileLoadFailure>
  | ActionType<typeof profileUpsert>
  | ActionType<typeof startEmailValidation>
  | ActionType<typeof acknowledgeOnEmailValidation>
  | ActionType<typeof profileFirstLogin>
  | ActionType<typeof clearCache>
  | ActionType<typeof removeAccountMotivation>;
