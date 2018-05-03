/**
 * Action types and action creator related to the Profile.
 */

import { ApiProfile, WithOnlyVersionRequired } from "../../api";
import {
  PROFILE_LOAD_FAILURE,
  PROFILE_LOAD_REQUEST,
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPDATE_FAILURE,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_SUCCESS
} from "./constants";

// Actions
export type ProfileLoadRequest = Readonly<{
  type: typeof PROFILE_LOAD_REQUEST;
}>;

export type ProfileLoadSuccess = Readonly<{
  type: typeof PROFILE_LOAD_SUCCESS;
  payload: ApiProfile;
}>;

export type ProfileLoadFailure = Readonly<{
  type: typeof PROFILE_LOAD_FAILURE;
  payload: string;
}>;

export type ProfileUpdateRequest = Readonly<{
  type: typeof PROFILE_UPDATE_REQUEST;
  payload: WithOnlyVersionRequired<ApiProfile>;
}>;

export type ProfileUpdateSuccess = Readonly<{
  type: typeof PROFILE_UPDATE_SUCCESS;
  payload: ApiProfile;
}>;

export type ProfileUpdateFailure = Readonly<{
  type: typeof PROFILE_UPDATE_FAILURE;
  payload: string;
}>;

export type ProfileActions =
  | ProfileLoadRequest
  | ProfileLoadSuccess
  | ProfileLoadFailure
  | ProfileUpdateRequest
  | ProfileUpdateSuccess
  | ProfileUpdateFailure;

// Creators
export const loadProfile = (): ProfileLoadRequest => ({
  type: PROFILE_LOAD_REQUEST
});

export const updateProfile = (
  newProfile: WithOnlyVersionRequired<ApiProfile>
): ProfileUpdateRequest => ({
  type: PROFILE_UPDATE_REQUEST,
  payload: newProfile
});
