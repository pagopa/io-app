import * as O from "fp-ts/lib/Option";
import { EmailAddress } from "../../../../../../definitions/backend/EmailAddress";
import { InitializedProfile } from "../../../../../../definitions/backend/InitializedProfile";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/ServicesPreferencesMode";

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
// return true if the profile has an email and it is validated
export const isProfileEmailAlreadyTaken = (user: InitializedProfile): boolean =>
  !!user.is_email_already_taken;
// Returns true if the profile has service_preferences_settings set to Legacy.
// A profile that has completed onboarding will have this value mandatory set to auto or manual
export const isProfileFirstOnBoarding = (user: InitializedProfile): boolean =>
  user.service_preferences_settings.mode === ServicesPreferencesModeEnum.LEGACY;
// return true if the profile has an email
export const hasProfileEmail = (user: InitializedProfile): boolean =>
  user.email !== undefined;

export const getProfileEmail = (
  user: InitializedProfile
): O.Option<EmailAddress> => O.fromNullable(user.email);

export const getProfileSpidEmail = (
  user: InitializedProfile
): O.Option<EmailAddress> => O.fromNullable(user.spid_email);
