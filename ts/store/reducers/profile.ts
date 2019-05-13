/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */

import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { UserProfileUnion } from "../../api/backend";

import {
  profileLoadSuccess,
  profileUpsert,
  resetProfileState
} from "../actions/profile";
import { Action } from "../actions/types";

import { GlobalState } from "./types";

export type ProfileState = pot.Pot<UserProfileUnion, Error>;

const INITIAL_STATE: ProfileState = pot.none;

// Selectors

export const profileSelector = (state: GlobalState): ProfileState =>
  state.profile;

const reducer = (
  state: ProfileState = INITIAL_STATE,
  action: Action
): ProfileState => {
  switch (action.type) {
    case getType(resetProfileState):
      return pot.none;

    case getType(profileLoadSuccess):
      // Store the loaded Profile in the store
      return pot.some(action.payload);

    //
    // upsert
    //

    case getType(profileUpsert.request):
      // TODO: remove the cast after: https://www.pivotaltracker.com/story/show/160924538
      // tslint:disable-next-line:no-useless-cast
      return pot.toUpdating(state, action.payload as any);

    case getType(profileUpsert.success):
      const updated = action.payload;
      const newVersion = updated.version;
      if (
        pot.isSome(state) &&
        newVersion !== undefined &&
        state.value.has_profile === true &&
        newVersion > state.value.version
      ) {
        // If current profile exist and we got a new (updated) version, we merge
        // the updated version in the existing profile.
        // Note: we cannot just assign the "updated" profile to the
        // cached one since they have two different types.
        // FIXME: one gets merged https://github.com/teamdigitale/italia-backend/pull/322
        return pot.some({
          ...state.value,
          email: updated.email,
          is_inbox_enabled: updated.is_inbox_enabled === true,
          is_webhook_enabled: updated.is_webhook_enabled === true,
          preferred_languages: updated.preferred_languages,
          blocked_inbox_or_channels: updated.blocked_inbox_or_channels,
          // FIXME: remove the cast after the following bug has been fixed:
          //        https://www.pivotaltracker.com/story/show/159802090
          version: newVersion as NonNegativeInteger, // tslint:disable-line:no-useless-cast
          accepted_tos_version: updated.accepted_tos_version
        });
      } else {
        // We can't merge an updated profile if we haven't loaded a full
        // profile yet
        return state;
      }

    case getType(profileUpsert.failure):
      return pot.toError(state, action.payload);

    default:
      return state;
  }
};

export default reducer;
