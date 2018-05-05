/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like
 * loading/error)
 * are managed by different global reducers.
 *
 * @flow
 */

import { none, Option, some } from "fp-ts/lib/Option";

import { Action } from "../../actions/types";
import { ApiProfile } from "../../api";
import {
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPDATE_SUCCESS
} from "../actions/constants";

export type ProfileState = Option<ApiProfile>;

export const INITIAL_STATE: ProfileState = none;

const reducer = (
  state: ProfileState = INITIAL_STATE,
  action: Action
): ProfileState => {
  switch (action.type) {
    case PROFILE_LOAD_SUCCESS:
      return some(action.payload);

    case PROFILE_UPDATE_SUCCESS:
      return some(action.payload);

    default:
      return state;
  }
};

export default reducer;
