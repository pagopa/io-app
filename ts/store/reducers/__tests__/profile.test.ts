import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import mockedProfile from "../../../__mocks__/initializedProfile";
import {
  hasProfileEmail,
  isProfileEmailValidated,
  isProfileEmailValidatedSelector,
  isProfileFirstOnBoarding,
  profileEmailSelector,
  ProfileState
} from "../profile";
import { ServicesPreferencesModeEnum } from "../../../../definitions/backend/ServicesPreferencesMode";
import { GlobalState } from "../types";

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
