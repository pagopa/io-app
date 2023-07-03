/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { EmailAddress } from "../../../definitions/backend/EmailAddress";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { capitalize } from "../../utils/strings";
import {
  profileLoadFailure,
  profileLoadRequest,
  profileLoadSuccess,
  profileUpsert,
  resetProfileState
} from "../actions/profile";
import { Action } from "../actions/types";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";
import { PushNotificationsContentTypeEnum } from "../../../definitions/backend/PushNotificationsContentType";
import { GlobalState } from "./types";

export type ProfileState = pot.Pot<InitializedProfile, Error>;

const INITIAL_STATE: ProfileState = pot.none;

// Selectors

export const profileSelector = (state: GlobalState): ProfileState =>
  state.profile;

export const isEmailEnabledSelector = createSelector(profileSelector, profile =>
  pot.getOrElse(
    pot.map(profile, p => p.is_email_enabled),
    false
  )
);

export const isInboxEnabledSelector = createSelector(profileSelector, profile =>
  pot.isSome(profile) && InitializedProfile.is(profile.value)
    ? profile.value.is_inbox_enabled
    : false
);

export const getProfileEmail = (
  user: InitializedProfile
): O.Option<EmailAddress> => O.fromNullable(user.email);

export const getProfileSpidEmail = (
  user: InitializedProfile
): O.Option<EmailAddress> => O.fromNullable(user.spid_email);

// return the email address (as a string) if the profile pot is some and its value is of kind InitializedProfile and it has an email
export const profileEmailSelector = createSelector(
  profileSelector,
  (profile: ProfileState): O.Option<string> =>
    pot.getOrElse(
      pot.map(profile, p => getProfileEmail(p)),
      O.none
    )
);

/**
 * Return the name of the profile if some, else undefined
 */
export const profileNameSelector = createSelector(
  profileSelector,
  (profile: ProfileState): string | undefined =>
    pot.getOrElse(
      pot.map(profile, p => capitalize(p.name)),
      undefined
    )
);

/**
 * Return the fiscal code of the profile if some, else undefined
 */
export const profileFiscalCodeSelector = createSelector(
  profileSelector,
  (profile: ProfileState): string | undefined =>
    pot.getOrElse(
      pot.map(profile, p => p.fiscal_code),
      undefined
    )
);

/**
 * The complete name + surname
 */
export const profileNameSurnameSelector = createSelector(
  profileSelector,
  (profile: ProfileState): string | undefined =>
    pot.getOrElse(
      pot.map(profile, p => capitalize(`${p.name} ${p.family_name}`)),
      undefined
    )
);

// return true if the profile has an email
export const hasProfileEmail = (user: InitializedProfile): boolean =>
  user.email !== undefined;

// return true if the profile has an email
export const hasProfileEmailSelector = createSelector(
  profileSelector,
  (profile: ProfileState): boolean =>
    pot.getOrElse(
      pot.map(profile, p => hasProfileEmail(p)),
      false
    )
);

// return the profile services preference mode
export const profileServicePreferencesModeSelector = createSelector(
  profileSelector,
  (profile: ProfileState): ServicesPreferencesModeEnum | undefined =>
    pot.getOrElse(
      pot.map(profile, p => p.service_preferences_settings.mode),
      undefined
    )
);

// return true if the profile services preference mode is set (mode is set only when AUTO or MANUAL is the current mode)
export const isServicesPreferenceModeSet = (
  mode: ServicesPreferencesModeEnum | undefined
): boolean =>
  [ServicesPreferencesModeEnum.AUTO, ServicesPreferencesModeEnum.MANUAL].some(
    sp => sp === mode
  );

// return true if the profile has an email and it is validated
export const isProfileEmailValidated = (user: InitializedProfile): boolean =>
  user.is_email_validated !== undefined && user.is_email_validated === true;

// Returns true if the profile has service_preferences_settings set to Legacy.
// A profile that has completed onboarding will have this value mandatory set to auto or manual
export const isProfileFirstOnBoarding = (user: InitializedProfile): boolean =>
  user.service_preferences_settings.mode === ServicesPreferencesModeEnum.LEGACY;

// return true if the profile pot is some and its field is_email_validated exists and it's true
export const isProfileEmailValidatedSelector = createSelector(
  profileSelector,
  (profile: ProfileState): boolean =>
    pot.getOrElse(
      pot.map(profile, p => hasProfileEmail(p) && isProfileEmailValidated(p)),
      false
    )
);

// return preferences
export const profilePreferencesSelector = createSelector(
  profileSelector,
  (
    profile: ProfileState
  ): pot.Pot<{ reminder: boolean; preview: boolean }, Error> =>
    pot.map(profile, p => ({
      reminder: p.reminder_status === ReminderStatusEnum.ENABLED,
      preview:
        p.push_notifications_content_type ===
        PushNotificationsContentTypeEnum.FULL
    }))
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
