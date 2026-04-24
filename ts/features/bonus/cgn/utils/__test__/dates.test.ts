import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import MockDate from "mockdate";
import { AppVersion } from "../../../../../../definitions/backend/identity/AppVersion";
import { EmailAddress } from "../../../../../../definitions/backend/identity/EmailAddress";
import { InitializedProfile } from "../../../../../../definitions/backend/identity/InitializedProfile";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/identity/PreferredLanguage";
import { PushNotificationsContentTypeEnum } from "../../../../../../definitions/backend/identity/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../../../definitions/backend/identity/ReminderStatus";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/identity/ServicesPreferencesMode";
import { canAccessCgn, getCgnUserAgeRange } from "../dates";
describe("dates", () => {
  describe("getCgnUserAgeRange", () => {
    beforeAll(() => {
      MockDate.set("2022-01-01");
    });

    it.each([
      [undefined, "unrecognized"],
      [new Date("1991-01-01"), "31-35"],
      // Birthdate is 6th Jan, so the user is still 30 years old on 1st Jan
      [new Date("1991-01-06"), "26-30"],
      [new Date("1994-01-06"), "26-30"],
      [new Date("1999-01-06"), "18-25"],
      [new Date("2004-01-01"), "18-25"],
      // Birthdate is 6th Jan, so the user is still 17 years old on 1st Jan
      [new Date("2004-01-06"), "unrecognized"],
      [new Date("2006-01-06"), "unrecognized"]
    ])(
      "when the birthdate is $birthDate the range should be $ageRange",
      (birthDate, ageRange) => {
        expect(getCgnUserAgeRange(birthDate)).toBe(ageRange);
      }
    );
  });

  describe("canAccessCgn", () => {
    const mockProfile: InitializedProfile = {
      accepted_tos_version: 1,
      email: "test@email.com" as EmailAddress,
      has_profile: true,
      is_email_enabled: true,
      is_email_validated: true,
      is_inbox_enabled: true,
      is_webhook_enabled: true,
      preferred_languages: [PreferredLanguageEnum.it_IT],
      push_notifications_content_type: PushNotificationsContentTypeEnum.FULL,
      reminder_status: ReminderStatusEnum.ENABLED,
      service_preferences_settings: {
        mode: ServicesPreferencesModeEnum.LEGACY
      },
      version: 1,
      fiscal_code: "RSSMRA99A12H501D" as FiscalCode,
      last_app_version: "1.0.0" as AppVersion,
      blocked_inbox_or_channels: {},
      family_name: "Doe",
      name: "John"
    };

    beforeAll(() => {
      MockDate.set("2026-01-01");
    });
    it("should return false if profile is not defined", () => {
      expect(canAccessCgn()).toBe(false);
    });

    it("should check fiscal code if date_of_birth is not defined", () => {
      // fiscal code is 99, in CGN range
      expect(canAccessCgn(mockProfile)).toBe(true);
      // fiscal code is 77, out of CGN range
      expect(
        canAccessCgn({
          ...mockProfile,
          fiscal_code: "RSSMRA77A12H501D" as FiscalCode
        })
      ).toBe(false);
    });

    it("should check date_of_birth field if defined", () => {
      expect(
        canAccessCgn({
          ...mockProfile,
          date_of_birth: new Date("2005-01-01")
        })
      ).toBe(true);

      expect(
        canAccessCgn({
          ...mockProfile,
          date_of_birth: new Date("1985-01-01")
        })
      ).toBe(false);
    });
  });
});
