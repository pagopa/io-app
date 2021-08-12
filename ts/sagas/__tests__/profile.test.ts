import { expectSaga, testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import {
  EmailString,
  FiscalCode,
  NonEmptyString
} from "italia-ts-commons/lib/strings";
import sha from "sha.js";
import { profileSagaTestable, watchProfile } from "../profile";
import {
  loadBonusBeforeRemoveAccount,
  profileLoadSuccess,
  removeAccountMotivation,
  startEmailValidation
} from "../../store/actions/profile";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { Version } from "../../../definitions/backend/Version";
import {
  differentProfileLoggedIn,
  setProfileHashedFiscalCode
} from "../../store/actions/crossSessions";
import { isDifferentFiscalCodeSelector } from "../../store/reducers/crossSessions";
import { GlobalState } from "../../store/reducers/types";
import { appReducer } from "../../store/reducers";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";

const hash = (value: string): string =>
  sha("sha256").update(value).digest("hex");

jest.mock("@react-native-community/async-storage", () => ({
  AsyncStorage: jest.fn()
}));

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

const mockedProfile: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO
  },
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

describe("watchProfile", () => {
  it("the all saga steps", () => {
    const startEmailValidationProcess = jest.fn();
    testSaga(watchProfile, startEmailValidationProcess)
      .next()
      .takeLatest(
        getType(startEmailValidation.request),
        profileSagaTestable!.startEmailValidationProcessSaga,
        startEmailValidationProcess
      )
      .next()
      .takeLatest(
        getType(profileLoadSuccess),
        profileSagaTestable!.checkLoadedProfile
      )
      .next()
      .takeLatest(
        loadBonusBeforeRemoveAccount,
        profileSagaTestable!.handleLoadBonusBeforeRemoveAccount
      )
      .next()
      .takeLatest(
        removeAccountMotivation,
        profileSagaTestable!.handleRemoveAccount
      );
  });

  const globalState: GlobalState = appReducer(
    undefined,
    setProfileHashedFiscalCode(mockedProfile.fiscal_code)
  );
  it("checkStoreHashedFiscalCode should not dispatch newProfileLoggedIn action", () =>
    expectSaga(
      profileSagaTestable!.checkStoreHashedFiscalCode,
      profileLoadSuccess(mockedProfile)
    )
      .withState(globalState)
      .select(isDifferentFiscalCodeSelector, mockedProfile.fiscal_code)
      .not.put(differentProfileLoggedIn())
      .put(setProfileHashedFiscalCode(mockedProfile.fiscal_code))
      .run());

  it.each`
    state          | storedFiscalCode
    ${"different"} | ${hash(`${mockedProfile.fiscal_code}xxx`)}
    ${"undefined"} | ${undefined}
  `(
    "checkStoreHashedFiscalCode should dispatch newProfileLoggedIn action if the stored hashed fiscal code is $state",
    async ({ storedFiscalCode }) =>
      expectSaga(
        profileSagaTestable!.checkStoreHashedFiscalCode,
        profileLoadSuccess(mockedProfile)
      )
        .withState({
          ...globalState,
          crossSessions: {
            hashedFiscalCode: storedFiscalCode
          }
        })
        .select(isDifferentFiscalCodeSelector, mockedProfile.fiscal_code)
        .put(differentProfileLoggedIn())
        .put(setProfileHashedFiscalCode(mockedProfile.fiscal_code))
        .run()
  );
});
