/**
 * Action types and action creator related to the Profile.
 */
import { ExtendedProfile } from "../../../definitions/backend/ExtendedProfile";

import { FullProfile, ProfileWithOrWithoutEmail } from "../../api/backend";

import {
  PROFILE_LOAD_FAILURE,
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPSERT_FAILURE,
  PROFILE_UPSERT_REQUEST,
  PROFILE_UPSERT_SUCCESS,
  RESET_PROFILE_STATE
} from "./constants";

// Actions

export type ResetProfileState = Readonly<{
  type: typeof RESET_PROFILE_STATE;
}>;

export type ProfileLoadSuccess = Readonly<{
  type: typeof PROFILE_LOAD_SUCCESS;
  payload: ProfileWithOrWithoutEmail;
}>;

export type ProfileLoadFailure = Readonly<{
  type: typeof PROFILE_LOAD_FAILURE;
  payload: Error;
  error: true;
}>;

export type ProfileUpsertRequest = Readonly<{
  type: typeof PROFILE_UPSERT_REQUEST;
  payload: ExtendedProfile;
}>;

export type ProfileUpsertSuccess = Readonly<{
  type: typeof PROFILE_UPSERT_SUCCESS;
  payload: FullProfile;
}>;

export type ProfileUpsertFailure = Readonly<{
  type: typeof PROFILE_UPSERT_FAILURE;
  payload: Error;
  error: true;
}>;

export type ProfileActions =
  | ResetProfileState
  | ProfileLoadSuccess
  | ProfileLoadFailure
  | ProfileUpsertRequest
  | ProfileUpsertSuccess
  | ProfileUpsertFailure;

// Creators

export const resetProfileState: ResetProfileState = {
  type: RESET_PROFILE_STATE
};

export const profileLoadSuccess = (
  profile: ProfileWithOrWithoutEmail
): ProfileLoadSuccess => ({
  type: PROFILE_LOAD_SUCCESS,
  payload: profile
});

export const profileLoadFailure = (error: Error): ProfileLoadFailure => ({
  type: PROFILE_LOAD_FAILURE,
  payload: error,
  error: true
});

export const profileUpsertRequest = (
  newProfile: ExtendedProfile
): ProfileUpsertRequest => ({
  type: PROFILE_UPSERT_REQUEST,
  payload: newProfile
});

export const profileUpsertSuccess = (
  profile: FullProfile
): ProfileUpsertSuccess => ({
  type: PROFILE_UPSERT_SUCCESS,
  payload: profile
});

export const profileUpsertFailure = (error: Error): ProfileUpsertFailure => ({
  type: PROFILE_UPSERT_FAILURE,
  payload: error,
  error: true
});
