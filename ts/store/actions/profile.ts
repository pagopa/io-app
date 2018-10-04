/**
 * Action types and action creator related to the Profile.
 */

import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

import { ExtendedProfile } from "../../../definitions/backend/ExtendedProfile";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";

import { UserProfileUnion } from "../../api/backend";

import { Omit } from "../../types/utils";

export const resetProfileState = createStandardAction("RESET_PROFILE_STATE")();

export const profileLoadSuccess = createStandardAction("PROFILE_LOAD_SUCCESS")<
  UserProfileUnion
>();

export const profileLoadFailure = createAction(
  "PROFILE_LOAD_FAILURE",
  resolve => (error: Error) => resolve(error, { error: true })
);

type ProfileUpsertPayload = Partial<Omit<ExtendedProfile, "version">>;

export const profileUpsertRequest = createStandardAction(
  "PROFILE_UPSERT_REQUEST"
)<ProfileUpsertPayload>();

export const profileUpsertSuccess = createStandardAction(
  "PROFILE_UPSERT_SUCCESS"
)<InitializedProfile>();

export const profileUpsertFailure = createAction(
  "PROFILE_UPSERT_FAILURE",
  resolve => (error: Error) => resolve(error, { error: true })
);

export type ProfileActions =
  | ActionType<typeof resetProfileState>
  | ActionType<typeof profileLoadSuccess>
  | ActionType<typeof profileLoadFailure>
  | ActionType<typeof profileUpsertRequest>
  | ActionType<typeof profileUpsertSuccess>
  | ActionType<typeof profileUpsertFailure>;
