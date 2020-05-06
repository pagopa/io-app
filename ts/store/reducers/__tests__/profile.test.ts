import { none, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import {
  EmailString,
  FiscalCode,
  NonEmptyString
} from "italia-ts-commons/lib/strings";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import { Version } from "../../../../definitions/backend/Version";
import {
  hasProfileEmail,
  isProfileEmailValidated,
  isProfileFirstOnBoarding,
  profileEmailSelector,
  ProfileState
} from "../profile";

const userProfileWithEmailAndValidated: InitializedProfile = {
  has_profile: true,
  is_inbox_enabled: true,
  is_webhook_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  email: "test@example.com" as EmailString,
  spid_email: "test@example.com" as EmailString,
  family_name: "Connor",
  name: "John",
  fiscal_code: "ABCDEF83A12L719R" as FiscalCode,
  spid_mobile_phone: "123" as NonEmptyString,
  version: 1 as Version
};

describe("email profile selector", () => {
  const potProfile: ProfileState = pot.some(userProfileWithEmailAndValidated);
  const someEmail = some(userProfileWithEmailAndValidated.email);
  it("should return the user's email address", () => {
    expect(profileEmailSelector.resultFunc(potProfile)).toStrictEqual(
      someEmail
    );
  });

  const potProfileWithNoEmail: ProfileState = pot.some({
    ...userProfileWithEmailAndValidated,
    email: undefined
  });
  it("should return the user's email address", () => {
    expect(
      profileEmailSelector.resultFunc(potProfileWithNoEmail)
    ).toStrictEqual(none);
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
      isProfileFirstOnBoarding({ ...potProfile.value, version: 0 as Version })
    ).toStrictEqual(true);
  });

  it("should return false when the user is not in his first onboarding", () => {
    expect(isProfileFirstOnBoarding(potProfile.value)).toStrictEqual(false);
  });
});
