/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */

import { ProfileWithOrWithoutEmail } from "../../api/backend";
import {
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPSERT_SUCCESS
} from "../actions/constants";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type ProfileState = ProfileWithOrWithoutEmail | null;

export const INITIAL_STATE: ProfileState = null;

// Selectors

export const profileSelector = (state: GlobalState): ProfileState =>
  state.profile;

const reducer = (
  state: ProfileState = INITIAL_STATE,
  action: Action
): ProfileState => {
  switch (action.type) {
    case PROFILE_LOAD_SUCCESS:
      // Store the loaded Profile in the store
      return action.payload;

    case PROFILE_UPSERT_SUCCESS:
      // Store the updated Profile with in the store
      return action.payload;

    default:
      return state;
  }
};

export default reducer;
