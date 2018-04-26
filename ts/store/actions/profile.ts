/**
 * Action types and action creator related to the Profile.
 */

import { ApiProfile, WithOnlyVersionRequired } from '../../api'
import {
  PROFILE_LOAD_REQUEST,
  PROFILE_LOAD_SUCCESS,
  PROFILE_LOAD_FAILURE,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_SUCCESS,
  PROFILE_UPDATE_FAILURE
} from './constants'

// Actions
export type ProfileLoadRequest = {
  type: typeof PROFILE_LOAD_REQUEST
}

export type ProfileLoadSuccess = {
  type: typeof PROFILE_LOAD_SUCCESS,
  payload: ApiProfile
}

export type ProfileLoadFailure = {
  type: typeof PROFILE_LOAD_FAILURE,
  payload: string
}

export type ProfileUpdateRequest = {
  type: typeof PROFILE_UPDATE_REQUEST,
  payload: WithOnlyVersionRequired<ApiProfile>
}

export type ProfileUpdateSuccess = {
  type: typeof PROFILE_UPDATE_SUCCESS,
  payload: ApiProfile
}

export type ProfileUpdateFailure = {
  type: typeof PROFILE_UPDATE_FAILURE,
  payload: string
}

export type ProfileActions =
  | ProfileLoadRequest
  | ProfileLoadSuccess
  | ProfileLoadFailure
  | ProfileUpdateRequest
  | ProfileUpdateSuccess
  | ProfileUpdateFailure

// Creators
export const loadProfile = (): ProfileLoadRequest => ({
  type: PROFILE_LOAD_REQUEST
})

export const updateProfile = (
  newProfile: WithOnlyVersionRequired<ApiProfile>
): ProfileUpdateRequest => ({
  type: PROFILE_UPDATE_REQUEST,
  payload: newProfile
})
