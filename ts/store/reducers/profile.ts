/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */

import { Profile } from "../../../definitions/backend/Profile";
import {
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPSERT_SUCCESS,
  RESET_PROFILE_STATE
} from "../actions/constants";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type ProfileState = Profile | null;

const INITIAL_STATE: ProfileState = null;

// Selectors

export const profileSelector = (state: GlobalState): ProfileState =>
  state.profile;

const reducer = (
  state: ProfileState = INITIAL_STATE,
  action: Action
): ProfileState => {
  switch (action.type) {
    case RESET_PROFILE_STATE:
      return null;

    case PROFILE_LOAD_SUCCESS:
    case PROFILE_UPSERT_SUCCESS:
      // Store the loaded Profile in the store
      return action.payload;

    default:
      return state;
  }
};

export default reducer;
