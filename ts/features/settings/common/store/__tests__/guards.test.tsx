import * as O from "fp-ts/lib/Option";
import {
  hasProfileEmail,
  isProfileEmailValidated,
  isProfileFirstOnBoarding,
  isProfileEmailAlreadyTaken,
  isServicesPreferenceModeSet,
  getProfileEmail,
  getProfileSpidEmail
} from "../utils/guards";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/ServicesPreferencesMode";
import { EmailAddress } from "../../../../../../definitions/backend/EmailAddress";
import { InitializedProfile } from "../../../../../../definitions/backend/InitializedProfile";

const baseProfile = {
  has_profile: true,
  is_email_enabled: true,
  is_inbox_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: false,
  preferred_languages: [],
  blocked_inbox_or_channels: {},
  accepted_tos_version: 1,
  service_preferences_settings: { mode: ServicesPreferencesModeEnum.AUTO },
  version: 1,
  family_name: "Rossi",
  fiscal_code: "ABCDEF12G34H567I" as any,
  name: "Mario"
};

describe("guards utils", () => {
  describe("isServicesPreferenceModeSet", () => {
    it("should return true if mode is AUTO", () => {
      expect(
        isServicesPreferenceModeSet(ServicesPreferencesModeEnum.AUTO)
      ).toBe(true);
    });

    it("should return true if mode is MANUAL", () => {
      expect(
        isServicesPreferenceModeSet(ServicesPreferencesModeEnum.MANUAL)
      ).toBe(true);
    });

    it("should return false if mode is LEGACY", () => {
      expect(
        isServicesPreferenceModeSet(ServicesPreferencesModeEnum.LEGACY)
      ).toBe(false);
    });

    it("should return false if mode is undefined", () => {
      expect(isServicesPreferenceModeSet(undefined)).toBe(false);
    });
  });

  describe("isProfileEmailValidated", () => {
    it("should return true if email is validated", () => {
      const profile: InitializedProfile = {
        ...baseProfile,
        is_email_validated: true
      };
      expect(isProfileEmailValidated(profile)).toBe(true);
    });

    it("should return false if email is not validated", () => {
      const profile: InitializedProfile = {
        ...baseProfile,
        is_email_validated: false
      };
      expect(isProfileEmailValidated(profile)).toBe(false);
    });

    it("should return false if email validated is undefined", () => {
      const profile: InitializedProfile = {
        ...baseProfile,
        is_email_validated: undefined as any
      };
      expect(isProfileEmailValidated(profile)).toBe(false);
    });
  });

  describe("isProfileEmailAlreadyTaken", () => {
    it("should return true if already taken is true", () => {
      const profile: InitializedProfile = {
        ...baseProfile,
        is_email_already_taken: true
      };
      expect(isProfileEmailAlreadyTaken(profile)).toBe(true);
    });

    it("should return false if already taken is false", () => {
      const profile: InitializedProfile = {
        ...baseProfile,
        is_email_already_taken: false
      };
      expect(isProfileEmailAlreadyTaken(profile)).toBe(false);
    });

    it("should return false if already taken is undefined", () => {
      const profile: InitializedProfile = {
        ...baseProfile,
        is_email_already_taken: undefined
      };
      expect(isProfileEmailAlreadyTaken(profile)).toBe(false);
    });
  });

  describe("isProfileFirstOnBoarding", () => {
    it("should return true if mode is LEGACY", () => {
      const profile: InitializedProfile = {
        ...baseProfile,
        service_preferences_settings: {
          mode: ServicesPreferencesModeEnum.LEGACY
        }
      };
      expect(isProfileFirstOnBoarding(profile)).toBe(true);
    });

    it("should return false if mode is not LEGACY", () => {
      const profile: InitializedProfile = {
        ...baseProfile,
        service_preferences_settings: { mode: ServicesPreferencesModeEnum.AUTO }
      };
      expect(isProfileFirstOnBoarding(profile)).toBe(false);
    });
  });

  describe("hasProfileEmail", () => {
    it("should return true if email is defined", () => {
      const profile: InitializedProfile = {
        ...baseProfile,
        email: "test@example.com" as EmailAddress
      };
      expect(hasProfileEmail(profile)).toBe(true);
    });

    it("should return false if email is undefined", () => {
      const profile: InitializedProfile = {
        ...baseProfile,
        email: undefined
      };
      expect(hasProfileEmail(profile)).toBe(false);
    });
  });

  describe("getProfileEmail", () => {
    it("should return Some(email) if email exists", () => {
      const email = "test@example.com" as EmailAddress;
      const profile: InitializedProfile = {
        ...baseProfile,
        email
      };
      expect(getProfileEmail(profile)).toEqual(O.some(email));
    });

    it("should return None if email is undefined", () => {
      const profile: InitializedProfile = {
        ...baseProfile,
        email: undefined
      };
      expect(getProfileEmail(profile)).toEqual(O.none);
    });
  });

  describe("getProfileSpidEmail", () => {
    it("should return Some(spid_email) if defined", () => {
      const spidEmail = "spid@example.com" as EmailAddress;
      const profile: InitializedProfile = {
        ...baseProfile,
        spid_email: spidEmail
      };
      expect(getProfileSpidEmail(profile)).toEqual(O.some(spidEmail));
    });

    it("should return None if spid_email is undefined", () => {
      const profile: InitializedProfile = {
        ...baseProfile,
        spid_email: undefined
      };
      expect(getProfileSpidEmail(profile)).toEqual(O.none);
    });
  });
});
