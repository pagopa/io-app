import { none, some } from "fp-ts/lib/Option";
import {
  EmailString,
  FiscalCode,
  NonEmptyString
} from "italia-ts-commons/lib/strings";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { Version } from "../../../definitions/backend/Version";
import { isEmailProfileChanged } from "../watchProfileEmailValidationChangedSaga";

const profile: InitializedProfile = {
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

describe("isEmailProfileChanged", () => {
  // true -> true -> no changes
  expect(isEmailProfileChanged(profile, some(true))).toBeFalsy();

  // false -> true -> changed
  expect(
    isEmailProfileChanged({ ...profile, is_email_validated: false }, some(true))
  ).toBeTruthy();

  // false -> false -> no changes
  expect(
    isEmailProfileChanged(
      { ...profile, is_email_validated: false },
      some(false)
    )
  ).toBeFalsy();

  // false -> none -> unknown
  expect(isEmailProfileChanged(profile, none)).toBeFalsy();

  // true -> false -> changed
  expect(
    isEmailProfileChanged({ ...profile, is_email_validated: true }, some(false))
  ).toBeTruthy();

  // undefined -> false -> unknown
  expect(
    isEmailProfileChanged(
      { ...profile, is_email_validated: undefined },
      some(false)
    )
  ).toBeFalsy();

  // undefined -> none -> unknown
  expect(
    isEmailProfileChanged(
      { ...profile, is_email_validated: undefined },
      some(false)
    )
  ).toBeFalsy();
});
