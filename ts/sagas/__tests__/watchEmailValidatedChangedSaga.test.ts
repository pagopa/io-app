import { none, some } from "fp-ts/lib/Option";
import { testSaga } from "redux-saga-test-plan";
import { profileLoadSuccess } from "../../store/actions/profile";
import { profileEmailValidationChanged } from "../../store/actions/profileEmailValidationChange";
import {
  isProfileEmailValidatedChanged,
  testableCheckProfileEmailChanged as checkProfileEmailChanged
} from "../watchProfileEmailValidationChangedSaga";
import mockedProfile from "../../__mocks__/initializedProfile";

describe("isEmailValidatedChanged", () => {
  it("test all the combination for the method isEmailValidatedChanged", () => {
    expect(isProfileEmailValidatedChanged(some(true), some(true))).toBeFalsy();
    expect(
      isProfileEmailValidatedChanged(some(false), some(false))
    ).toBeFalsy();
    expect(isProfileEmailValidatedChanged(none, some(false))).toBeFalsy();
    expect(isProfileEmailValidatedChanged(none, some(true))).toBeFalsy();
    expect(isProfileEmailValidatedChanged(some(false), none)).toBeFalsy();
    expect(isProfileEmailValidatedChanged(some(true), none)).toBeFalsy();
    expect(isProfileEmailValidatedChanged(none, none)).toBeFalsy();

    expect(
      isProfileEmailValidatedChanged(some(true), some(false))
    ).toBeTruthy();
    expect(
      isProfileEmailValidatedChanged(some(false), some(true))
    ).toBeTruthy();
  });
});

describe("checkProfileEmailChanged", () => {
  it("should end with no action dispatched", () => {
    if (checkProfileEmailChanged !== undefined) {
      testSaga(checkProfileEmailChanged, profileLoadSuccess(mockedProfile))
        .next()
        .isDone();
    }
  });

  it("should dispatch emailValidationChanged(false) true -> false", () => {
    if (checkProfileEmailChanged !== undefined) {
      testSaga(
        checkProfileEmailChanged,
        profileLoadSuccess({ ...mockedProfile, is_email_validated: false })
      )
        .next()
        .put(profileEmailValidationChanged(false))
        .next()
        .isDone();
    }
  });

  it("should end with no actions dispatched (no changes is_email_validated is always false) false -> false", () => {
    if (checkProfileEmailChanged !== undefined) {
      testSaga(
        checkProfileEmailChanged,
        profileLoadSuccess({ ...mockedProfile, is_email_validated: false })
      )
        .next()
        .isDone();
    }
  });

  it("should dispatch emailValidationChanged(true) false -> true", () => {
    if (checkProfileEmailChanged !== undefined) {
      testSaga(
        checkProfileEmailChanged,
        profileLoadSuccess({ ...mockedProfile, is_email_validated: true })
      )
        .next()
        .put(profileEmailValidationChanged(true))
        .next()
        .isDone();
    }
  });

  it("should end with no actions dispatched (no changes is_email_validated is always true) true -> true", () => {
    if (checkProfileEmailChanged !== undefined) {
      testSaga(
        checkProfileEmailChanged,
        profileLoadSuccess({ ...mockedProfile, is_email_validated: true })
      )
        .next()
        .isDone();
    }
  });

  it("should end with no actions dispatched (is_email_validated is undefined) true -> undefined", () => {
    if (checkProfileEmailChanged !== undefined) {
      testSaga(
        checkProfileEmailChanged,
        profileLoadSuccess({ ...mockedProfile, is_email_validated: undefined })
      )
        .next()
        .isDone();
    }
  });
});
