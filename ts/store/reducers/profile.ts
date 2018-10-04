/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */

import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import { getType } from "typesafe-actions";

import { UserProfileUnion } from "../../api/backend";

import {
  profileLoadSuccess,
  profileUpsertSuccess,
  resetProfileState
} from "../actions/profile";
import { Action } from "../actions/types";

import { GlobalState } from "./types";

export type ProfileState = UserProfileUnion | null;

const INITIAL_STATE: ProfileState = null;

// Selectors

export const profileSelector = (state: GlobalState): ProfileState =>
  state.profile;

const reducer = (
  state: ProfileState = INITIAL_STATE,
  action: Action
): ProfileState => {
  switch (action.type) {
    case getType(resetProfileState):
      return null;

    case getType(profileLoadSuccess):
      // Store the loaded Profile in the store
      return action.payload;

    case getType(profileUpsertSuccess):
      const updated = action.payload;
      const newVersion = updated.version;
      if (
        state !== null &&
        newVersion !== undefined &&
        state.has_profile === true &&
        newVersion > state.version
      ) {
        // If current profile exist and we got a new (updated) version, we merge
        // the updated version in the existing profile.
        // Note: we cannot just assign the "updated" profile to the
        // cached one since they have two different types.
        // FIXME: one gets merged https://github.com/teamdigitale/italia-backend/pull/322
        return {
          ...state,
          email: updated.email,
          is_inbox_enabled: updated.is_inbox_enabled === true,
          is_webhook_enabled: updated.is_webhook_enabled === true,
          preferred_languages: updated.preferred_languages,
          blocked_inbox_or_channels: updated.blocked_inbox_or_channels,
          // FIXME: remove the cast after the following bug has been fixed:
          //        https://www.pivotaltracker.com/story/show/159802090
          version: newVersion as NonNegativeInteger // tslint:disable-line:no-useless-cast
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
