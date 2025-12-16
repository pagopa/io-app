import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  profileLoadFailure,
  profileLoadRequest,
  profileLoadSuccess,
  profileUpsert,
  resetProfileState
} from "../actions";
import { InitializedProfile } from "../../../../../../definitions/backend/InitializedProfile";
import { ProfileError } from "../types";
import { EmailAddress } from "../../../../../../definitions/backend/EmailAddress";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/ServicesPreferencesMode";
import reducer, { exported } from "../reducers";

const testableModule = exported!;

const fakeProfile: InitializedProfile = {
  has_profile: true,
  email: "test@example.com" as EmailAddress,
  is_email_enabled: true,
  is_email_validated: true,
  is_inbox_enabled: true,
  is_webhook_enabled: false,
  preferred_languages: [PreferredLanguageEnum.it_IT],
  blocked_inbox_or_channels: {},
  accepted_tos_version: 1,
  service_preferences_settings: { mode: ServicesPreferencesModeEnum.AUTO },
  version: 1,
  family_name: "Doe",
  fiscal_code: "RSSMRA85M01H501Z" as any,
  name: "John"
};

describe("profileReducer", () => {
  it("should return initial state", () => {
    expect(reducer(undefined, { type: "UNKNOWN_ACTION" } as any)).toEqual(
      testableModule.INITIAL_STATE
    );
  });

  it("should handle resetProfileState", () => {
    const state = reducer(pot.some(fakeProfile), resetProfileState());
    expect(state).toEqual(testableModule.INITIAL_STATE);
  });

  it("should handle profileLoadRequest", () => {
    const state = reducer(testableModule.INITIAL_STATE, profileLoadRequest());
    expect(pot.isLoading(state)).toBe(true);
  });

  it("should handle profileLoadSuccess", () => {
    const state = reducer(
      testableModule.INITIAL_STATE,
      profileLoadSuccess(fakeProfile)
    );
    expect(pot.isSome(state)).toBe(true);
    if (pot.isSome(state)) {
      expect(state.value).toEqual(fakeProfile);
    }
  });

  it("should handle profileLoadFailure", () => {
    const error: ProfileError = {
      type: "PROFILE_GENRIC_ERROR",
      name: "GENERIC_ERROR",
      message: "fail"
    };
    const state = reducer(
      testableModule.INITIAL_STATE,
      profileLoadFailure(error)
    );
    expect(pot.isError(state)).toBe(true);
  });

  it("should handle profileUpsert.success with version update", () => {
    const oldProfile = pot.some({ ...fakeProfile, version: 1 });
    const newProfile = {
      ...fakeProfile,
      version: 2,
      email: "new@domain.com" as EmailAddress
    };
    const state = reducer(
      oldProfile,
      profileUpsert.success({
        newValue: newProfile,
        value: fakeProfile
      })
    );
    expect(pot.isSome(state)).toBe(true);
    if (pot.isSome(state)) {
      expect(state.value.version).toBe(2);
      expect(state.value.email).toBe("new@domain.com");
    }
  });

  it("should handle profileUpsert.failure", () => {
    const error: ProfileError = {
      type: "PROFILE_GENRIC_ERROR",
      name: "GENERIC_ERROR",
      message: "fail"
    };
    const state = reducer(pot.some(fakeProfile), profileUpsert.failure(error));
    expect(pot.isError(state)).toBe(true);
  });
});
