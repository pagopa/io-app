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

export const profileLoadSuccess = createAction(
  "PROFILE_LOAD_SUCCESS",
  resolve => (profile: UserProfileUnion) => resolve(profile)
);

export const profileLoadFailure = createAction(
  "PROFILE_LOAD_FAILURE",
  resolve => (error: Error) => resolve(error, { error: true })
);

export const profileUpsertRequest = createAction(
  "PROFILE_UPSERT_REQUEST",
  resolve => (newProfile: Partial<Omit<ExtendedProfile, "version">>) =>
    resolve(newProfile)
);

export const profileUpsertSuccess = createAction(
  "PROFILE_UPSERT_SUCCESS",
  resolve => (profile: InitializedProfile) => resolve(profile)
);

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
