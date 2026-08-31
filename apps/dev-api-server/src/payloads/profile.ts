import { InitializedProfile } from "@io-app/api-types/generated/definitions/identity/InitializedProfile";
import { PushNotificationsContentTypeEnum } from "@io-app/api-types/generated/definitions/identity/PushNotificationsContentType";
import { ReminderStatusEnum } from "@io-app/api-types/generated/definitions/identity/ReminderStatus";
import { ServicesPreferencesModeEnum } from "@io-app/api-types/generated/definitions/identity/ServicesPreferencesMode";
import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { ioDevServerConfig } from "../config";

const profileAttrConfig = ioDevServerConfig.profile.attrs;

const optInOutputSelector =
  (reminderStatus: ReminderStatusEnum) =>
  (pushNotificationsContentType: PushNotificationsContentTypeEnum) => ({
    reminder_status: reminderStatus,
    push_notifications_content_type: pushNotificationsContentType
  });
const remindersStatusInputSelector: O.Option<ReminderStatusEnum> =
  O.fromNullable(ioDevServerConfig.profile.attrs.reminder_status);
const pushNotificationContentTypeInputSelector: O.Option<PushNotificationsContentTypeEnum> =
  O.fromNullable(
    ioDevServerConfig.profile.attrs.push_notifications_content_type
  );

type OptInProps = {
  push_notifications_content_type?: PushNotificationsContentTypeEnum;
  reminder_status?: ReminderStatusEnum;
};

const optInNotificationPreferences = pipe(
  O.some(optInOutputSelector),
  O.ap(remindersStatusInputSelector),
  O.ap(pushNotificationContentTypeInputSelector),
  O.getOrElse((): OptInProps => ({}))
);

const birthDate = "1991-01-06";
const spidProfile: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO
  },
  accepted_tos_version: profileAttrConfig.accepted_tos_version,
  email: profileAttrConfig.email,
  family_name: profileAttrConfig.family_name,
  has_profile: true,
  is_inbox_enabled: true,
  is_email_already_taken: profileAttrConfig.is_email_already_taken ?? false,
  is_email_enabled: true,
  is_email_validated: profileAttrConfig.is_email_validated ?? true,
  is_webhook_enabled: true,
  name: profileAttrConfig.name,
  version: 1,
  date_of_birth: pipe(
    birthDate,
    DateFromString.decode,
    E.getOrElseW(() => new Date())
  ),
  fiscal_code: profileAttrConfig.fiscal_code,
  preferred_languages: profileAttrConfig.preferred_languages,
  ...optInNotificationPreferences
};

// mock a SPID profile on first onboarding
const spidProfileFirstOnboarding: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.LEGACY
  },
  email: profileAttrConfig.email,
  family_name: profileAttrConfig.family_name,
  has_profile: true,
  is_inbox_enabled: false,
  is_webhook_enabled: false,
  is_email_enabled: true,
  is_email_already_taken: profileAttrConfig.is_email_already_taken ?? false,
  is_email_validated: profileAttrConfig.is_email_validated ?? true,
  name: profileAttrConfig.name,
  version: 0,
  date_of_birth: pipe(
    birthDate,
    DateFromString.decode,
    E.getOrElseW(() => new Date())
  ),
  fiscal_code: profileAttrConfig.fiscal_code
};

const cieProfile: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO
  },
  email: profileAttrConfig.email,
  accepted_tos_version: profileAttrConfig.accepted_tos_version,
  family_name: profileAttrConfig.family_name,
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_already_taken: profileAttrConfig.is_email_already_taken ?? false,
  is_email_validated: profileAttrConfig.is_email_validated ?? true,
  is_webhook_enabled: true,
  name: profileAttrConfig.name,
  version: 1,
  date_of_birth: pipe(
    birthDate,
    DateFromString.decode,
    E.getOrElseW(() => new Date())
  ),
  fiscal_code: profileAttrConfig.fiscal_code,
  preferred_languages: profileAttrConfig.preferred_languages,
  ...optInNotificationPreferences
};

// mock a cie profile on first onboarding
const cieProfileFirstOnboarding: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.LEGACY
  },
  family_name: profileAttrConfig.family_name,
  has_profile: true,
  is_email_enabled: true,
  is_email_validated: profileAttrConfig.is_email_validated ?? true,
  is_email_already_taken: profileAttrConfig.is_email_already_taken ?? false,
  is_inbox_enabled: false,
  is_webhook_enabled: false,
  name: profileAttrConfig.name,
  version: 0,
  date_of_birth: pipe(
    birthDate,
    DateFromString.decode,
    E.getOrElseW(() => new Date())
  ),
  fiscal_code: profileAttrConfig.fiscal_code
};
const spidCie = {
  spid: {
    first: spidProfileFirstOnboarding,
    existing: spidProfile
  },
  cie: {
    first: cieProfileFirstOnboarding,
    existing: cieProfile
  }
};

export type AuthenticationProvider =
  typeof ioDevServerConfig.profile.authenticationProvider;

export const getProfileInitialData = (
  authenticationProvider: AuthenticationProvider
) =>
  ioDevServerConfig.profile.firstOnboarding
    ? spidCie[authenticationProvider].first
    : spidCie[authenticationProvider].existing;
