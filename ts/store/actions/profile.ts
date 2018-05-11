/**
 * Action types and action creator related to the Profile.
 */

import { IApiProfile, WithOnlyVersionRequired } from "../../api/types";
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
  payload: IApiProfile;
}>;

export type ProfileLoadFailure = Readonly<{
  type: typeof PROFILE_LOAD_FAILURE;
  payload: string;
}>;

export type ProfileUpdateRequest = Readonly<{
  type: typeof PROFILE_UPDATE_REQUEST;
  payload: WithOnlyVersionRequired<IApiProfile>;
}>;

export type ProfileUpdateSuccess = Readonly<{
  type: typeof PROFILE_UPDATE_SUCCESS;
  payload: IApiProfile;
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
  newProfile: WithOnlyVersionRequired<IApiProfile>
): ProfileUpdateRequest => ({
  type: PROFILE_UPDATE_REQUEST,
  payload: newProfile
});
