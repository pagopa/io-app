/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like
 * loading/error)
 * are managed by different global reducers.
 *
 * @flow
 */

import { Action } from "../../actions/types";
import { IApiProfile } from "../../api/types";
import {
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPDATE_SUCCESS
} from "../actions/constants";

export type ProfileState = IApiProfile | null;

export const INITIAL_STATE: ProfileState = null;

const reducer = (
  state: ProfileState = INITIAL_STATE,
  action: Action
): ProfileState => {
  switch (action.type) {
    case PROFILE_LOAD_SUCCESS:
      return action.payload;

    case PROFILE_UPDATE_SUCCESS:
      return action.payload;

    default:
      return state;
  }
};

export default reducer;
