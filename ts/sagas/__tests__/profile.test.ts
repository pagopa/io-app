import { expectSaga, testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import sha from "sha.js";
import {
  profileSagaTestable,
  upsertAppVersionSaga,
  watchProfile
} from "../profile";
import {
  loadBonusBeforeRemoveAccount,
  profileLoadSuccess,
  profileUpsert,
  removeAccountMotivation,
  startEmailValidation
} from "../../store/actions/profile";
import {
  differentProfileLoggedIn,
  setProfileHashedFiscalCode
} from "../../store/actions/crossSessions";
import { isDifferentFiscalCodeSelector } from "../../store/reducers/crossSessions";
import { GlobalState } from "../../store/reducers/types";
import { appReducer } from "../../store/reducers";
import mockedProfile from "../../__mocks__/initializedProfile";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { getAppVersion } from "../../utils/appVersion";
import { AppVersion } from "../../../definitions/backend/AppVersion";

const hash = (value: string): string =>
  sha("sha256").update(value).digest("hex");

jest.mock("@react-native-community/async-storage", () => ({
  AsyncStorage: jest.fn()
}));

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

const fiscalCodeHash = hash(`${mockedProfile.fiscal_code}xxx`);

describe("profile", () => {
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
      ${"different"} | ${fiscalCodeHash}
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

  describe("upsertAppVersionSaga", () => {
    it("should trigger the app version upsert request since there's not a stored version", () => {
      const createOrUpdateProfile = jest.fn();
      const storedAppVersion = undefined;
      const currentAppVersion = "1.2.4";

      const requestAction = profileUpsert.request({
        last_app_version: currentAppVersion as AppVersion
      });

      testSaga(
        upsertAppVersionSaga,
        { last_app_version: storedAppVersion } as InitializedProfile,
        createOrUpdateProfile
      )
        .next()
        .call(getAppVersion)
        .next(currentAppVersion)
        .call(profileUpsert.request, {
          last_app_version: currentAppVersion
        })
        .next(requestAction)
        .call(
          profileSagaTestable!.createOrUpdateProfileSaga,
          createOrUpdateProfile,
          requestAction
        )
        .next()
        .isDone();
    });

    it("should trigger the app version upsert request since the stored version is different", () => {
      const createOrUpdateProfile = jest.fn();
      const storedAppVersion = "1.2.3";
      const currentAppVersion = "1.2.4";

      const requestAction = profileUpsert.request({
        last_app_version: currentAppVersion as AppVersion
      });

      testSaga(
        upsertAppVersionSaga,
        { last_app_version: storedAppVersion } as InitializedProfile,
        createOrUpdateProfile
      )
        .next()
        .call(getAppVersion)
        .next(currentAppVersion)
        .call(profileUpsert.request, {
          last_app_version: currentAppVersion
        })
        .next(requestAction)
        .call(
          profileSagaTestable!.createOrUpdateProfileSaga,
          createOrUpdateProfile,
          requestAction
        )
        .next()
        .isDone();
    });

    it("should NOT trigger the app version upsert request because the stored app version is the same", () => {
      const createOrUpdateProfile = jest.fn();
      const storedAppVersion = "1.2.3";
      const currentAppVersion = "1.2.3";

      testSaga(
        upsertAppVersionSaga,
        { last_app_version: storedAppVersion } as InitializedProfile,
        createOrUpdateProfile
      )
        .next()
        .call(getAppVersion)
        .next(currentAppVersion)
        .isDone();
    });

    it("should NOT trigger the app version upsert request since the local version is not in the right format", () => {
      const createOrUpdateProfile = jest.fn();
      const storedAppVersion = "1.2.3";
      const currentAppVersion = "1.2";

      testSaga(
        upsertAppVersionSaga,
        { last_app_version: storedAppVersion } as InitializedProfile,
        createOrUpdateProfile
      )
        .next()
        .call(getAppVersion)
        .next(currentAppVersion)
        .isDone();
    });
  });
});
