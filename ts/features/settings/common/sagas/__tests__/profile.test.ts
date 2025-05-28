import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";

import { expectSaga, testSaga } from "redux-saga-test-plan";
import sha from "sha.js";
import { getType } from "typesafe-actions";
import { IResponseType } from "@pagopa/ts-commons/lib/requests";
import * as t from "io-ts";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { AppVersion } from "../../../../../../definitions/backend/AppVersion";
import {
  differentProfileLoggedIn,
  setProfileHashedFiscalCode
} from "../../../../../store/actions/crossSessions";
import {
  loadBonusBeforeRemoveAccount,
  profileLoadFailure,
  profileLoadSuccess,
  profileUpsert,
  removeAccountMotivation,
  startEmailValidation
} from "../../store/actions";
import { appReducer } from "../../../../../store/reducers";
import { isDifferentFiscalCodeSelector } from "../../../../../store/reducers/crossSessions";
import { profileSelector } from "../../store/selectors";
import { GlobalState } from "../../../../../store/reducers/types";
import { getAppVersion } from "../../../../../utils/appVersion";
import mockedProfile from "../../../../../__mocks__/initializedProfile";
import {
  loadProfile,
  profileSagaTestable,
  upsertAppVersionSaga,
  watchProfile
} from "../profile";
import { upsertUserDataProcessing } from "../../store/actions/userDataProcessing";
import { navigateToRemoveAccountSuccess } from "../../../../../store/actions/navigation";
import { UserDataProcessingChoiceEnum } from "../../../../../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../../../../definitions/backend/UserDataProcessingStatus";
import { EmailAddress } from "../../../../../../definitions/backend/EmailAddress";
import { InitializedProfile } from "../../../../../../definitions/backend/InitializedProfile";
import { PushNotificationsContentTypeEnum } from "../../../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../../../definitions/backend/ReminderStatus";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/ServicesPreferencesMode";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";

const hash = (value: string): string =>
  sha("sha256").update(value).digest("hex");

jest.mock("@react-native-async-storage/async-storage", () => ({
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
        .not.put(differentProfileLoggedIn({ isNewInstall: false }))
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
          .put(
            differentProfileLoggedIn({
              isNewInstall: storedFiscalCode === undefined ? true : false
            })
          )
          .put(setProfileHashedFiscalCode(mockedProfile.fiscal_code))
          .run()
    );
  });

  describe("upsertAppVersionSaga", () => {
    it("should trigger the app version upsert request since there's not a stored version", () => {
      const storedAppVersion = undefined;
      const currentAppVersion = "1.2.4";

      const requestAction = profileUpsert.request({
        last_app_version: currentAppVersion as AppVersion
      });

      testSaga(upsertAppVersionSaga)
        .next()
        .select(profileSelector)
        .next(pot.some({ last_app_version: storedAppVersion }))
        .call(getAppVersion)
        .next(currentAppVersion)
        .call(profileUpsert.request, {
          last_app_version: currentAppVersion
        })
        .next(requestAction)
        .put(requestAction)
        .next()
        .take([profileUpsert.success, profileUpsert.failure])
        .next(profileUpsert.success({} as any))
        .isDone();
    });

    it("should trigger the app version upsert request since the stored version is different", () => {
      const storedAppVersion = "1.2.3";
      const currentAppVersion = "1.2.4";

      const requestAction = profileUpsert.request({
        last_app_version: currentAppVersion as AppVersion
      });

      testSaga(upsertAppVersionSaga)
        .next()
        .select(profileSelector)
        .next(pot.some({ last_app_version: storedAppVersion }))
        .call(getAppVersion)
        .next(currentAppVersion)
        .call(profileUpsert.request, {
          last_app_version: currentAppVersion
        })
        .next(requestAction)
        .put(requestAction)
        .next()
        .take([profileUpsert.success, profileUpsert.failure])
        .next(profileUpsert.failure(new Error()))
        .isDone();
    });

    it("should NOT trigger the app version upsert request because the stored app version is the same", () => {
      const storedAppVersion = "1.2.3";
      const currentAppVersion = "1.2.3";

      testSaga(upsertAppVersionSaga)
        .next()
        .select(profileSelector)
        .next(pot.some({ last_app_version: storedAppVersion }))
        .call(getAppVersion)
        .next(currentAppVersion)
        .isDone();
    });

    it("should NOT trigger the app version upsert request since the local version is not in the right format", () => {
      const storedAppVersion = "1.2.3";
      const currentAppVersion = "1.2";

      testSaga(upsertAppVersionSaga)
        .next()
        .select(profileSelector)
        .next(pot.some({ last_app_version: storedAppVersion }))
        .call(getAppVersion)
        .next(currentAppVersion)
        .isDone();
    });
  });

  describe("startEmailValidationProcessSaga", () => {
    it("should start the email validation process and dispatch success", () => {
      const startEmailValidationProcessMock = jest.fn(() =>
        Promise.resolve(
          E.right({
            status: 202,
            value: undefined,
            headers: {} // puoi aggiungere anche altri campi se serve
          } as IResponseType<202, undefined, never>)
        )
      );

      return expectSaga(
        profileSagaTestable!.startEmailValidationProcessSaga,
        startEmailValidationProcessMock
      )
        .put(startEmailValidation.success())
        .run();
    });
  });

  describe("handleRemoveAccount", () => {
    it("should navigate on success", () =>
      expectSaga(profileSagaTestable!.handleRemoveAccount)
        .put(
          upsertUserDataProcessing.request(UserDataProcessingChoiceEnum.DELETE)
        )
        .provide([
          {
            take(effect, next) {
              if (
                effect.pattern &&
                Array.isArray(effect.pattern) &&
                effect.pattern.includes(upsertUserDataProcessing.success)
              ) {
                return upsertUserDataProcessing.success({
                  choice: UserDataProcessingChoiceEnum.DOWNLOAD,
                  status: UserDataProcessingStatusEnum.PENDING,
                  version: 0
                });
              }
              return next();
            }
          }
        ])
        .call.fn(navigateToRemoveAccountSuccess)
        .run());
  });

  describe("checkLoadedProfile", () => {
    it("should skip upsertAppVersionSaga if accepted_tos_version is missing", () => {
      const profileWithoutTos = {
        ...mockedProfile,
        accepted_tos_version: undefined
      };
      return expectSaga(
        profileSagaTestable!.checkLoadedProfile,
        profileLoadSuccess(profileWithoutTos)
      )
        .withState({ crossSessions: {}, profile: pot.some(profileWithoutTos) })
        .run(); // Se `upsertAppVersionSaga` venisse chiamato, ci sarebbe un errore di selezione
    });
  });

  describe("createOrUpdateProfileSaga", () => {
    it("should early return if profile is pot.none", () =>
      expectSaga(
        profileSagaTestable!.createOrUpdateProfileSaga,
        jest.fn(),
        profileUpsert.request({ email: "test@email.com" as EmailAddress })
      )
        .withState({ profile: pot.none })
        .run());
  });

  const mockProfile: InitializedProfile = {
    accepted_tos_version: 1,
    email: "test@email.com" as EmailAddress,
    has_profile: true,
    is_email_enabled: true,
    is_email_validated: true,
    is_inbox_enabled: true,
    is_webhook_enabled: true,
    preferred_languages: [PreferredLanguageEnum.it_IT],
    push_notifications_content_type: PushNotificationsContentTypeEnum.FULL,
    reminder_status: ReminderStatusEnum.ENABLED,
    service_preferences_settings: {
      mode: ServicesPreferencesModeEnum.LEGACY
    },
    version: 1,
    fiscal_code: "AAAAAA00A00A000A" as FiscalCode,
    last_app_version: "1.0.0" as AppVersion,
    blocked_inbox_or_channels: {},
    family_name: "Doe",
    name: "John"
  };

  describe("loadProfile saga", () => {
    it("should dispatch failure when getProfile fails with E.left", () => {
      const getProfileMock = jest.fn(() =>
        Promise.resolve(
          E.left([
            {
              context: [],
              message: "Mocked error",
              value: null
            }
          ] as t.Errors)
        )
      );

      return expectSaga(loadProfile, getProfileMock)
        .put.actionType(getType(profileLoadFailure))
        .run();
    });

    it("should dispatch failure when response status is not 200", () => {
      const getProfileMock = jest.fn(() =>
        Promise.resolve(
          E.right({
            status: 500,
            value: {},
            headers: {}
          } as IResponseType<500, any, any>)
        )
      );

      return expectSaga(loadProfile, getProfileMock)
        .put.actionType(getType(profileLoadFailure))
        .run();
    });

    it("should dispatch success and return profile on 200", () => {
      const getProfileMock = jest.fn(() =>
        Promise.resolve(
          E.right({
            status: 200,
            value: mockProfile,
            headers: {}
          } as IResponseType<200, InitializedProfile, any>)
        )
      );

      return expectSaga(loadProfile, getProfileMock)
        .put(profileLoadSuccess(mockProfile))
        .returns(O.some(mockProfile))
        .run();
    });
  });
});
