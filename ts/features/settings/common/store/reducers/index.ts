/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { InitializedProfile } from "../../../../../../definitions/backend/InitializedProfile";
import {
  profileLoadFailure,
  profileLoadRequest,
  profileLoadSuccess,
  profileUpsert,
  resetProfileState
} from "../actions";
import { Action } from "../../../../../store/actions/types";
import { ProfileError } from "../types";
import { isProfileFirstOnBoarding } from "../utils/guards";
import { isDevEnv } from "../../../../../utils/environment";
import { loginSuccess } from "../../../../authentication/common/store/actions";

export type ProfileState = pot.Pot<InitializedProfile, ProfileError>;

const INITIAL_STATE: ProfileState = pot.none;

const reducer = (
  state: ProfileState = INITIAL_STATE,
  action: Action
): ProfileState => {
  switch (action.type) {
    case getType(resetProfileState):
    case getType(loginSuccess):
      return pot.none;

    case getType(profileLoadRequest):
      return pot.toLoading(state);

    case getType(profileLoadSuccess):
      // Store the loaded Profile in the store
      return pot.some(action.payload);

    case getType(profileLoadFailure):
      return pot.toError(state, action.payload);

    //
    // upsert
    //

    case getType(profileUpsert.request):
      if (!pot.isSome(state)) {
        return state;
      }
      return pot.toUpdating(state, { ...state.value, ...action.payload });

    case getType(profileUpsert.success):
      if (pot.isSome(state)) {
        const currentProfile = state.value;
        const newProfile = action.payload.newValue;
        // The API profile is still absent
        if (
          !currentProfile.has_profile &&
          newProfile.has_profile &&
          isProfileFirstOnBoarding(newProfile)
        ) {
          return pot.some({
            ...currentProfile,
            has_profile: true,
            email: newProfile.email,
            is_email_enabled: newProfile.is_email_enabled === true,
            is_inbox_enabled: newProfile.is_inbox_enabled === true,
            is_email_validated: newProfile.is_email_validated === true,
            is_webhook_enabled: newProfile.is_webhook_enabled === true,
            preferred_languages: newProfile.preferred_languages,
            blocked_inbox_or_channels: newProfile.blocked_inbox_or_channels,
            accepted_tos_version: newProfile.accepted_tos_version,
            service_preferences_settings:
              newProfile.service_preferences_settings,
            reminder_status: newProfile.reminder_status,
            push_notifications_content_type:
              newProfile.push_notifications_content_type,
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
            last_app_version: newProfile.last_app_version,
            is_inbox_enabled: newProfile.is_inbox_enabled === true,
            is_email_enabled: newProfile.is_email_enabled === true,
            is_email_validated: newProfile.is_email_validated === true,
            is_webhook_enabled: newProfile.is_webhook_enabled === true,
            preferred_languages: newProfile.preferred_languages,
            blocked_inbox_or_channels: newProfile.blocked_inbox_or_channels,
            accepted_tos_version: newProfile.accepted_tos_version,
            service_preferences_settings:
              newProfile.service_preferences_settings,
            reminder_status: newProfile.reminder_status,
            push_notifications_content_type:
              newProfile.push_notifications_content_type,
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

export const exported = isDevEnv
  ? {
      INITIAL_STATE
    }
  : null;
