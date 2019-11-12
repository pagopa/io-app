/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */

import { Option, none, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { UserProfileUnion } from "../../api/backend";

import {
  profileLoadSuccess,
  profileUpsert,
  resetProfileState
} from "../actions/profile";
import { Action } from "../actions/types";

import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { GlobalState } from "./types";

export type ProfileState = pot.Pot<UserProfileUnion, Error>;

const INITIAL_STATE: ProfileState = pot.none;

// Selectors

export const profileSelector = (state: GlobalState): ProfileState =>
  state.profile;

// return the email (as a string) if the profile pot is some and its value is of kind InitializedProfile
export const emailProfileSelector = (profile: ProfileState): Option<string> =>
  pot.getOrElse(
    pot.map(profile, p => {
      if (InitializedProfile.is(p) && p.email) {
        return some(p.email as string);
      }
      return none;
    }),
    none
  );

// return true if the profile pot is some and its field is_email_validated exists and it's true
export const isProfileEmailValidated = (profile: ProfileState): boolean =>
  pot.getOrElse(
    pot.map(
      profile,
      p =>
        InitializedProfile.is(p) &&
        p.is_email_validated !== undefined &&
        p.is_email_validated === true
    ),
    false
  );

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
      if (pot.isSome(state)) {
        const currentProfile = state.value;
        const newProfile = action.payload;
        // The API profile is still absent
        if (
          !currentProfile.has_profile &&
          newProfile.has_profile &&
          newProfile.version === 0
        ) {
          return pot.some({
            ...currentProfile,
            has_profile: true,
            email: newProfile.email,
            is_email_enabled: newProfile.is_email_enabled,
            is_inbox_enabled: newProfile.is_inbox_enabled === true,
            is_webhook_enabled: newProfile.is_webhook_enabled === true,
            preferred_languages: newProfile.preferred_languages,
            blocked_inbox_or_channels: newProfile.blocked_inbox_or_channels,
            accepted_tos_version: newProfile.accepted_tos_version,
            version: 0
          });
        }

        // We already have a API profile
        if (
          currentProfile.has_profile &&
          newProfile.has_profile &&
          currentProfile.version < newProfile.version
        ) {
          return pot.some({
            ...currentProfile,
            email: newProfile.email,
            is_inbox_enabled: newProfile.is_inbox_enabled === true,
            is_webhook_enabled: newProfile.is_webhook_enabled === true,
            preferred_languages: newProfile.preferred_languages,
            blocked_inbox_or_channels: newProfile.blocked_inbox_or_channels,
            accepted_tos_version: newProfile.accepted_tos_version,
            version: newProfile.version
          });
        }

        return state;
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
