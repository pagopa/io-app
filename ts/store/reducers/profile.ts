/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */

import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";

import { ProfileWithOrWithoutEmail } from "../../api/backend";

import {
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPSERT_SUCCESS,
  RESET_PROFILE_STATE
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
    case RESET_PROFILE_STATE:
      return null;

    case PROFILE_LOAD_SUCCESS:
      // Store the loaded Profile in the store
      return action.payload;

    case PROFILE_UPSERT_SUCCESS:
      const updated = action.payload;
      const newVersion = updated.version;
      if (
        state !== null &&
        newVersion !== undefined &&
        newVersion > state.version
      ) {
        // If current profile exist and we got a new (updated) version, we merge
        // the updated version in the existing profile.
        // Note: we cannot just assign the "updated" profile to the
        // cached one since they have two different types.
        // FIXME: why we have two different types here?
        return {
          ...state,
          email: updated.email,
          is_inbox_enabled: updated.is_inbox_enabled === true,
          is_webhook_enabled: updated.is_webhook_enabled === true,
          preferred_languages: updated.preferred_languages,
          blocked_inbox_or_channels: updated.blocked_inbox_or_channels,
          // FIXME: since we have this weird situation with two different
          //        types for the profile we have to manually update the
          //        `is_email_set` attribute that is managed by the backend
          //        but that, during an upsert, is missing from the API response.
          is_email_set: updated.email !== undefined,
          // FIXME: remove the cast after the following bug has been fixed:
          //        https://www.pivotaltracker.com/story/show/159802090
          version: newVersion as NonNegativeInteger
        };
      } else {
        // We can't merge an updated profile if we haven't loaded a full
        // profile yet
        return state;
      }

    default:
      return state;
  }
};

export default reducer;
