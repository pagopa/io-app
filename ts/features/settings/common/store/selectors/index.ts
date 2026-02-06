import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { ProfileState } from "../reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { capitalize } from "../../../../../utils/strings";
import {
  isProfileFirstOnBoarding,
  isProfileEmailValidated,
  hasProfileEmail,
  getProfileEmail
} from "../utils/guards";
import { InitializedProfile } from "../../../../../../definitions/backend/identity/InitializedProfile";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/identity/ServicesPreferencesMode";
import { PushNotificationsContentTypeEnum } from "../../../../../../definitions/backend/identity/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../../../definitions/backend/identity/ReminderStatus";

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
// return if the profile email user is already taken
export const isProfileEmailAlreadyTakenSelector = createSelector(
  profileSelector,
  (profile: ProfileState): boolean | undefined =>
    pot.getOrElse(
      pot.map(profile, p => p.is_email_already_taken),
      undefined
    )
);

export const isProfileFirstOnBoardingSelector = createSelector(
  profileSelector,
  (profile: ProfileState): boolean | undefined =>
    pot.getOrElse(
      pot.map(profile, p => isProfileFirstOnBoarding(p)),
      undefined
    )
);
// return true if the profile pot is some and its field is_email_validated exists and it's true

export const isProfileEmailValidatedSelector = (state: GlobalState) =>
  pipe(
    state,
    profileSelector,
    profileStatusPot =>
      pot.map(
        profileStatusPot,
        profileStatus =>
          hasProfileEmail(profileStatus) &&
          isProfileEmailValidated(profileStatus)
      ),
    profileEmailValidatedPot => pot.getOrElse(profileEmailValidatedPot, false)
  );

export const isEmailValidatedSelector = createSelector(
  isProfileEmailValidatedSelector,
  isEmailValidated => isEmailValidated
);

export const profileHasErrorSelector = (state: GlobalState) =>
  pipe(state.profile, pot.isError);

export const profileIsUpdatingSelector = (state: GlobalState) =>
  pipe(state.profile, pot.isUpdating);

export const pushNotificationRemindersEnabledSelector = (state: GlobalState) =>
  pipe(
    state.profile,
    pot.toOption,
    O.chainNullableK(profile => profile.reminder_status),
    O.map(reminderStatus => reminderStatus === ReminderStatusEnum.ENABLED),
    O.getOrElse(() => false)
  );

export const pushNotificationPreviewEnabledSelector = (state: GlobalState) =>
  pipe(
    state.profile,
    pot.toOption,
    O.chainNullableK(profile => profile.push_notifications_content_type),
    O.map(
      pushNotificationContentType =>
        pushNotificationContentType === PushNotificationsContentTypeEnum.FULL
    ),
    O.getOrElse(() => false)
  );
// return the profile notification settings actual state or undefined if ProfileState pot is in an Error state

export const profileNotificationSettingsSelector = createSelector(
  profileSelector,
  (
    profile: ProfileState
  ):
    | { reminder: boolean | undefined; preview: boolean | undefined }
    | undefined =>
    pot.getOrElse(
      pot.map(profile, p => ({
        reminder:
          p.reminder_status === undefined
            ? undefined
            : p.reminder_status === ReminderStatusEnum.ENABLED,
        preview:
          p.push_notifications_content_type === undefined
            ? undefined
            : p.push_notifications_content_type ===
              PushNotificationsContentTypeEnum.FULL
      })),
      undefined
    )
);
// return the tos version or undefined if ProfileState pot is in an Error state

export const tosVersionSelector = createSelector(
  profileSelector,
  (profile: ProfileState): number | undefined =>
    pot.getOrElse(
      pot.map(profile, p => p.accepted_tos_version),
      undefined
    )
);
