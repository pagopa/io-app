import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import mockedProfile from "../../../../../__mocks__/initializedProfile";
import { ProfileState } from "../reducers";
import {
  isProfileEmailValidatedSelector,
  profileEmailSelector,
  profileHasErrorSelector,
  profileIsUpdatingSelector,
  pushNotificationPreviewEnabledSelector,
  pushNotificationRemindersEnabledSelector
} from "../selectors";
import {
  isProfileEmailValidated,
  isProfileFirstOnBoarding,
  hasProfileEmail
} from "../utils/guards";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/ServicesPreferencesMode";
import { GlobalState } from "../../../../../store/reducers/types";
import { ReminderStatusEnum } from "../../../../../../definitions/backend/ReminderStatus";
import { ProfileError } from "../types";
import { PushNotificationsContentTypeEnum } from "../../../../../../definitions/backend/PushNotificationsContentType";

describe("email profile selector", () => {
  const potProfile: ProfileState = pot.some(mockedProfile);
  const someEmail = O.some(mockedProfile.email);
  it("should return the user's email address", () => {
    expect(profileEmailSelector.resultFunc(potProfile)).toStrictEqual(
      someEmail
    );
  });

  const potProfileWithNoEmail: ProfileState = pot.some({
    ...mockedProfile,
    email: undefined
  });
  it("should return the user's email address", () => {
    expect(
      profileEmailSelector.resultFunc(potProfileWithNoEmail)
    ).toStrictEqual(O.none);
  });

  it("should return true when user has an email", () => {
    expect(hasProfileEmail(potProfile.value)).toStrictEqual(true);
  });

  it("should return false when user has not an email", () => {
    expect(
      hasProfileEmail({ ...potProfile.value, email: undefined })
    ).toStrictEqual(false);
  });

  it("should return true when user has an email and it is validated", () => {
    expect(isProfileEmailValidated(potProfile.value)).toStrictEqual(true);
  });

  it("should return false when user has an email and it is NOT validated", () => {
    expect(
      isProfileEmailValidated({
        ...potProfile.value,
        is_email_validated: false
      })
    ).toStrictEqual(false);
  });

  it("should return true when the user is in his first onboarding", () => {
    expect(
      isProfileFirstOnBoarding({
        ...potProfile.value,
        service_preferences_settings: {
          mode: ServicesPreferencesModeEnum.LEGACY
        }
      })
    ).toStrictEqual(true);
  });

  it("should return false when the user is not in his first onboarding", () => {
    expect(isProfileFirstOnBoarding(potProfile.value)).toStrictEqual(false);
  });
});

describe("isProfileEmailValidatedSelector", () => {
  it("should return false for pot.none profile", () => {
    const state = {
      profile: pot.none
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return false for pot.noneLoading profile", () => {
    const state = {
      profile: pot.noneLoading
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return false for pot.noneUpdating profile", () => {
    const state = {
      profile: pot.noneUpdating({
        email: "namesurname@domain.com",
        is_email_validated: true
      })
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return false for pot.noneError profile", () => {
    const state = {
      profile: pot.noneError(new Error())
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return false for pot.some profile with undefined email", () => {
    const state = {
      profile: pot.some({
        is_email_validated: true
      })
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return false for pot.some profile with defined email but undefined is_email_validated", () => {
    const state = {
      profile: pot.some({
        email: "namesurname@domain.com"
      })
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return false for pot.some profile with defined email but false is_email_validated", () => {
    const state = {
      profile: pot.some({
        email: "namesurname@domain.com",
        is_email_validated: false
      })
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return true for pot.some profile with defined email and validated email", () => {
    const state = {
      profile: pot.some({
        email: "namesurname@domain.com",
        is_email_validated: true
      })
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(true);
  });
  it("should return false for pot.someLoading profile with undefined email", () => {
    const state = {
      profile: pot.someLoading({
        is_email_validated: true
      })
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return false for pot.someLoading profile with defined email but undefined is_email_validated", () => {
    const state = {
      profile: pot.someLoading({
        email: "namesurname@domain.com"
      })
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return false for pot.someLoading profile with defined email but false is_email_validated", () => {
    const state = {
      profile: pot.someLoading({
        email: "namesurname@domain.com",
        is_email_validated: false
      })
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return true for pot.someLoading profile with defined email and validated email", () => {
    const state = {
      profile: pot.someLoading({
        email: "namesurname@domain.com",
        is_email_validated: true
      })
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(true);
  });
  it("should return false for pot.someUpdating profile with undefined email", () => {
    const state = {
      profile: pot.someUpdating(
        {
          is_email_validated: true
        },
        {
          email: "namesurname@domain.com",
          is_email_validated: true
        }
      )
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return false for pot.someUpdating profile with defined email but undefined is_email_validated", () => {
    const state = {
      profile: pot.someUpdating(
        {
          email: "namesurname@domain.com"
        },
        {
          email: "namesurname@domain.com",
          is_email_validated: true
        }
      )
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return false for pot.someUpdating profile with defined email but false is_email_validated", () => {
    const state = {
      profile: pot.someUpdating(
        {
          email: "namesurname@domain.com",
          is_email_validated: false
        },
        {
          email: "namesurname@domain.com",
          is_email_validated: true
        }
      )
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return true for pot.someUpdating profile with defined email and validated email", () => {
    const state = {
      profile: pot.someUpdating(
        {
          email: "namesurname@domain.com",
          is_email_validated: true
        },
        {}
      )
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(true);
  });
  it("should return false for pot.someError profile with undefined email", () => {
    const state = {
      profile: pot.someError(
        {
          is_email_validated: true
        },
        new Error()
      )
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return false for pot.someError profile with defined email but undefined is_email_validated", () => {
    const state = {
      profile: pot.someError(
        {
          email: "namesurname@domain.com"
        },
        new Error()
      )
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return false for pot.someError profile with defined email but false is_email_validated", () => {
    const state = {
      profile: pot.someError(
        {
          email: "namesurname@domain.com",
          is_email_validated: false
        },
        new Error()
      )
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(false);
  });
  it("should return true for pot.someError profile with defined email and validated email", () => {
    const state = {
      profile: pot.someError(
        {
          email: "namesurname@domain.com",
          is_email_validated: true
        },
        new Error()
      )
    } as GlobalState;
    const isProfileEmailValidated = isProfileEmailValidatedSelector(state);
    expect(isProfileEmailValidated).toBe(true);
  });
});

describe("pushNotificationRemindersEnabledSelector", () => {
  it("should return false for a pot.none profile", () => {
    const globalState = {
      profile: pot.none
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(false);
  });
  it("should return false for a pot.noneLoading profile", () => {
    const globalState = {
      profile: pot.noneLoading
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(false);
  });
  it("should return false for a pot.noneUpdating profile", () => {
    const globalState = {
      profile: pot.noneUpdating({
        reminder_status: ReminderStatusEnum.ENABLED
      })
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(false);
  });
  it("should return false for a pot.noneError profile", () => {
    const globalState = {
      profile: pot.noneError(new ProfileError("test error"))
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(false);
  });
  it("should return false for a pot.some profile with undefined reminder_status", () => {
    const globalState = {
      profile: pot.some({ reminder_status: undefined })
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(false);
  });
  it("should return false for a pot.some profile with DISABLED reminder_status", () => {
    const globalState = {
      profile: pot.some({ reminder_status: ReminderStatusEnum.DISABLED })
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(false);
  });
  it("should return true for a pot.some profile with ENABLED reminder_status", () => {
    const globalState = {
      profile: pot.some({ reminder_status: ReminderStatusEnum.ENABLED })
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(true);
  });
  it("should return false for a pot.someLoading profile with undefined reminder_status", () => {
    const globalState = {
      profile: pot.someLoading({ reminder_status: undefined })
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(false);
  });
  it("should return false for a pot.someLoading profile with DISABLED reminder_status", () => {
    const globalState = {
      profile: pot.someLoading({ reminder_status: ReminderStatusEnum.DISABLED })
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(false);
  });
  it("should return true for a pot.someLoading profile with ENABLED reminder_status", () => {
    const globalState = {
      profile: pot.someLoading({ reminder_status: ReminderStatusEnum.ENABLED })
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(true);
  });
  it("should return false for a pot.someUpdating profile with undefined reminder_status", () => {
    const globalState = {
      profile: pot.someUpdating(
        { reminder_status: undefined },
        { reminder_status: ReminderStatusEnum.ENABLED }
      )
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(false);
  });
  it("should return false for a pot.someUpdating profile with DISABLED reminder_status", () => {
    const globalState = {
      profile: pot.someUpdating(
        { reminder_status: ReminderStatusEnum.DISABLED },
        { reminder_status: ReminderStatusEnum.ENABLED }
      )
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(false);
  });
  it("should return true for a pot.someUpdating profile with ENABLED reminder_status", () => {
    const globalState = {
      profile: pot.someUpdating(
        { reminder_status: ReminderStatusEnum.ENABLED },
        { reminder_status: ReminderStatusEnum.DISABLED }
      )
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(true);
  });
  it("should return false for a pot.someError profile with undefined reminder_status", () => {
    const globalState = {
      profile: pot.someError(
        { reminder_status: undefined },
        new ProfileError("test error")
      )
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(false);
  });
  it("should return false for a pot.someError profile with DISABLED reminder_status", () => {
    const globalState = {
      profile: pot.someError(
        { reminder_status: ReminderStatusEnum.DISABLED },
        new ProfileError("test error")
      )
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(false);
  });
  it("should return true for a pot.someError profile with ENABLED reminder_status", () => {
    const globalState = {
      profile: pot.someError(
        { reminder_status: ReminderStatusEnum.ENABLED },
        new ProfileError("test error")
      )
    } as GlobalState;
    const remindersEnabled =
      pushNotificationRemindersEnabledSelector(globalState);
    expect(remindersEnabled).toBe(true);
  });
});

describe("pushNotificationPreviewEnabledSelector", () => {
  it("should return false for a pot.none profile", () => {
    const globalState = {
      profile: pot.none
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(false);
  });
  it("should return false for a pot.noneLoading profile", () => {
    const globalState = {
      profile: pot.noneLoading
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(false);
  });
  it("should return false for a pot.noneUpdating profile", () => {
    const globalState = {
      profile: pot.noneUpdating({
        reminder_status: ReminderStatusEnum.ENABLED
      })
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(false);
  });
  it("should return false for a pot.noneError profile", () => {
    const globalState = {
      profile: pot.noneError(new ProfileError("test error"))
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(false);
  });
  it("should return false for a pot.some profile with undefined push_notifications_content_type", () => {
    const globalState = {
      profile: pot.some({ push_notifications_content_type: undefined })
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(false);
  });
  it("should return false for a pot.some profile with ANONYMOUS push_notifications_content_type", () => {
    const globalState = {
      profile: pot.some({
        push_notifications_content_type:
          PushNotificationsContentTypeEnum.ANONYMOUS
      })
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(false);
  });
  it("should return true for a pot.some profile with FULL push_notifications_content_type", () => {
    const globalState = {
      profile: pot.some({
        push_notifications_content_type: PushNotificationsContentTypeEnum.FULL
      })
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(true);
  });
  it("should return false for a pot.someLoading profile with undefined push_notifications_content_type", () => {
    const globalState = {
      profile: pot.someLoading({ push_notifications_content_type: undefined })
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(false);
  });
  it("should return false for a pot.someLoading profile with ANONYMOUS push_notifications_content_type", () => {
    const globalState = {
      profile: pot.someLoading({
        push_notifications_content_type:
          PushNotificationsContentTypeEnum.ANONYMOUS
      })
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(false);
  });
  it("should return true for a pot.someLoading profile with FULL push_notifications_content_type", () => {
    const globalState = {
      profile: pot.someLoading({
        push_notifications_content_type: PushNotificationsContentTypeEnum.FULL
      })
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(true);
  });
  it("should return false for a pot.someUpdating profile with undefined push_notifications_content_type", () => {
    const globalState = {
      profile: pot.someUpdating(
        { push_notifications_content_type: undefined },
        {
          push_notifications_content_type:
            PushNotificationsContentTypeEnum.ANONYMOUS
        }
      )
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(false);
  });
  it("should return false for a pot.someUpdating profile with ANONYMOUS push_notifications_content_type", () => {
    const globalState = {
      profile: pot.someUpdating(
        {
          push_notifications_content_type:
            PushNotificationsContentTypeEnum.ANONYMOUS
        },
        {
          push_notifications_content_type:
            PushNotificationsContentTypeEnum.ANONYMOUS
        }
      )
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(false);
  });
  it("should return true for a pot.someUpdating profile with FULL push_notifications_content_type", () => {
    const globalState = {
      profile: pot.someUpdating(
        {
          push_notifications_content_type: PushNotificationsContentTypeEnum.FULL
        },
        {
          push_notifications_content_type:
            PushNotificationsContentTypeEnum.ANONYMOUS
        }
      )
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(true);
  });
  it("should return false for a pot.someError profile with undefined push_notifications_content_type", () => {
    const globalState = {
      profile: pot.someError(
        { push_notifications_content_type: undefined },
        new ProfileError("test error")
      )
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(false);
  });
  it("should return false for a pot.someError profile with ANONYMOUS push_notifications_content_type", () => {
    const globalState = {
      profile: pot.someError(
        {
          push_notifications_content_type:
            PushNotificationsContentTypeEnum.ANONYMOUS
        },
        new ProfileError("test error")
      )
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(false);
  });
  it("should return true for a pot.someError profile with FULL push_notifications_content_type", () => {
    const globalState = {
      profile: pot.someError(
        {
          push_notifications_content_type: PushNotificationsContentTypeEnum.FULL
        },
        new ProfileError("test error")
      )
    } as GlobalState;
    const previewEnabled = pushNotificationPreviewEnabledSelector(globalState);
    expect(previewEnabled).toBe(true);
  });
});

describe("profileHasErrorSelector", () => {
  it("should return false for a pot.none profile", () => {
    const globalState = {
      profile: pot.none
    } as GlobalState;
    const hasError = profileHasErrorSelector(globalState);
    expect(hasError).toBe(false);
  });
  it("should return false for a pot.noneLoading profile", () => {
    const globalState = {
      profile: pot.noneLoading
    } as GlobalState;
    const hasError = profileHasErrorSelector(globalState);
    expect(hasError).toBe(false);
  });
  it("should return false for a pot.noneUpdating profile", () => {
    const globalState = {
      profile: pot.noneUpdating({})
    } as GlobalState;
    const hasError = profileHasErrorSelector(globalState);
    expect(hasError).toBe(false);
  });
  it("should return true for a pot.error profile", () => {
    const globalState = {
      profile: pot.noneError(new ProfileError("test error"))
    } as GlobalState;
    const hasError = profileHasErrorSelector(globalState);
    expect(hasError).toBe(true);
  });
  it("should return false for a pot.some profile", () => {
    const globalState = {
      profile: pot.some({})
    } as GlobalState;
    const hasError = profileHasErrorSelector(globalState);
    expect(hasError).toBe(false);
  });
  it("should return false for a pot.someLoading profile", () => {
    const globalState = {
      profile: pot.someLoading({})
    } as GlobalState;
    const hasError = profileHasErrorSelector(globalState);
    expect(hasError).toBe(false);
  });
  it("should return false for a pot.someUpdating profile", () => {
    const globalState = {
      profile: pot.someUpdating({}, {})
    } as GlobalState;
    const hasError = profileHasErrorSelector(globalState);
    expect(hasError).toBe(false);
  });
  it("should return true for a pot.none profile", () => {
    const globalState = {
      profile: pot.someError({}, new ProfileError("test error"))
    } as GlobalState;
    const hasError = profileHasErrorSelector(globalState);
    expect(hasError).toBe(true);
  });
});

describe("profileIsUpdatingSelector", () => {
  it("should return false for a pot.none profile", () => {
    const globalState = {
      profile: pot.none
    } as GlobalState;
    const isUpdating = profileIsUpdatingSelector(globalState);
    expect(isUpdating).toBe(false);
  });
  it("should return false for a pot.noneLoading profile", () => {
    const globalState = {
      profile: pot.noneLoading
    } as GlobalState;
    const isUpdating = profileIsUpdatingSelector(globalState);
    expect(isUpdating).toBe(false);
  });
  it("should return true for a pot.noneUpdating profile", () => {
    const globalState = {
      profile: pot.noneUpdating({})
    } as GlobalState;
    const isUpdating = profileIsUpdatingSelector(globalState);
    expect(isUpdating).toBe(true);
  });
  it("should return false for a pot.error profile", () => {
    const globalState = {
      profile: pot.noneError(new ProfileError("test error"))
    } as GlobalState;
    const isUpdating = profileIsUpdatingSelector(globalState);
    expect(isUpdating).toBe(false);
  });
  it("should return false for a pot.some profile", () => {
    const globalState = {
      profile: pot.some({})
    } as GlobalState;
    const isUpdating = profileIsUpdatingSelector(globalState);
    expect(isUpdating).toBe(false);
  });
  it("should return false for a pot.someLoading profile", () => {
    const globalState = {
      profile: pot.someLoading({})
    } as GlobalState;
    const isUpdating = profileIsUpdatingSelector(globalState);
    expect(isUpdating).toBe(false);
  });
  it("should return true for a pot.someUpdating profile", () => {
    const globalState = {
      profile: pot.someUpdating({}, {})
    } as GlobalState;
    const isUpdating = profileIsUpdatingSelector(globalState);
    expect(isUpdating).toBe(true);
  });
  it("should return false for a pot.someError profile", () => {
    const globalState = {
      profile: pot.someError({}, new ProfileError("test error"))
    } as GlobalState;
    const isUpdating = profileIsUpdatingSelector(globalState);
    expect(isUpdating).toBe(false);
  });
});
