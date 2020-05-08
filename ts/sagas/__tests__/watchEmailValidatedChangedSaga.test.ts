import { none, some } from "fp-ts/lib/Option";
import { isProfileEmailValidatedChanged } from "../watchProfileEmailValidationChangedSaga";

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
