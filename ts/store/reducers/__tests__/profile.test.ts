import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import mockedProfile from "../../../__mocks__/initializedProfile";
import {
  hasProfileEmail,
  isProfileEmailValidated,
  isProfileFirstOnBoarding,
  profileEmailSelector,
  ProfileState
} from "../profile";
import { ServicesPreferencesModeEnum } from "../../../../definitions/backend/ServicesPreferencesMode";

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
