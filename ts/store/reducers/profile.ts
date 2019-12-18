/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { UserProfile } from "../../../definitions/backend/UserProfile";
import { UserProfileUnion } from "../../api/backend";
import {
  profileLoadRequest,
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

export const getProfileEmail = (user: UserProfile): Option<string> => {
  if (InitializedProfile.is(user) && user.email) {
    return some(user.email as string);
  }
  return none;
};

// return the email address (as a string) if the profile pot is some and its value is of kind InitializedProfile and it has an email
export const profileEmailSelector = createSelector(
  profileSelector,
  (profile: ProfileState): Option<string> =>
    pot.getOrElse(pot.map(profile, p => getProfileEmail(p)), none)
);

// return true if the profile has an email
export const hasProfileEmail = (user: UserProfile): boolean =>
  InitializedProfile.is(user) && user.email !== undefined;

// return true if the profile has an email and it is validated
export const isProfileEmailValidated = (user: UserProfile): boolean =>
  InitializedProfile.is(user) &&
  user.is_email_validated !== undefined &&
  user.is_email_validated === true;

// return true if the profile has version equals to 0
export const isProfileFirstOnBoarding = (user: UserProfile): boolean =>
  InitializedProfile.is(user) && user.version === 0;

// return true if the profile pot is some and its field is_email_validated exists and it's true
export const isProfileEmailValidatedSelector = createSelector(
  profileSelector,
  (profile: ProfileState): boolean =>
    pot.getOrElse(
      pot.map(profile, p => hasProfileEmail(p) && isProfileEmailValidated(p)),
      false
    )
);

const reducer = (
  state: ProfileState = INITIAL_STATE,
  action: Action
): ProfileState => {
  switch (action.type) {
    case getType(resetProfileState):
      return pot.none;

    case getType(profileLoadRequest):
      return pot.toLoading(state);

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
            is_email_validated: newProfile.is_email_validated === true,
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
            is_email_validated: newProfile.is_email_validated === true,
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
