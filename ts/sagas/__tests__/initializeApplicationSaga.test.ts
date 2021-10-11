import { none, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";

import { startApplicationInitialization } from "../../store/actions/application";
import { sessionExpired } from "../../store/actions/authentication";
import { previousInstallationDataDeleteSuccess } from "../../store/actions/installation";
import { resetProfileState } from "../../store/actions/profile";
import {
  sessionInfoSelector,
  sessionTokenSelector
} from "../../store/reducers/authentication";
import { profileSelector } from "../../store/reducers/profile";
import { SessionToken } from "../../types/SessionToken";
import { previousInstallationDataDeleteSaga } from "../installation";
import { initMixpanel } from "../mixpanel";
import {
  loadProfile,
  watchProfile,
  watchProfileUpsertRequestsSaga
} from "../profile";
import { initializeApplicationSaga } from "../startup";
import { watchSessionExpiredSaga } from "../startup/watchSessionExpiredSaga";
import { watchProfileEmailValidationChangedSaga } from "../watchProfileEmailValidationChangedSaga";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import mockedProfile from "../../__mocks__/initializedProfile";

const aSessionToken = "a_session_token" as SessionToken;

jest.mock("react-native-background-timer", () => ({
  startTimer: jest.fn()
}));

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

jest.mock("../../api/backend");

const profile: InitializedProfile = {
  ...mockedProfile,
  is_email_enabled: false,
  is_email_validated: undefined
};

describe("initializeApplicationSaga", () => {
  it("should dispatch startApplicationInitialization if check session response is 200 but session is none", () => {
    testSaga(initializeApplicationSaga)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .put(previousInstallationDataDeleteSuccess())
      .next()
      .call(initMixpanel)
      .next()
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, none)
      .next()
      .put(resetProfileState())
      .next()
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .fork(watchSessionExpiredSaga)
      .next()
      .next(200) // checkSession
      .next() // updateInstallationSaga
      .select(sessionInfoSelector)
      .next(none)
      .next(none) // loadSessionInformationSaga
      .put(startApplicationInitialization());
  });

  it("should dispatch sessionExpired if check session response is 401", () => {
    testSaga(initializeApplicationSaga)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .put(previousInstallationDataDeleteSuccess())
      .next()
      .call(initMixpanel)
      .next()
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, none)
      .next(pot.some(profile))
      .put(resetProfileState())
      .next()
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .fork(watchSessionExpiredSaga)
      .next()
      .next(401) // checksession
      .put(sessionExpired());
  });

  it("should dispatch loadprofile if installation id response is 200 and session is still valid", () => {
    testSaga(initializeApplicationSaga)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .put(previousInstallationDataDeleteSuccess())
      .next()
      .call(initMixpanel)
      .next()
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, none)
      .next(pot.some(profile))
      .put(resetProfileState())
      .next()
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .fork(watchSessionExpiredSaga)
      .next()
      .next(200) // check session
      .next() // updateInstallationSaga
      .select(sessionInfoSelector)
      .next(
        some({
          spidLevel: "https://www.spid.gov.it/SpidL2",
          walletToken: "wallet_token"
        })
      )
      .fork(watchProfileUpsertRequestsSaga, undefined)
      .next()
      .fork(watchProfile, undefined)
      .next()
      .call(loadProfile, undefined);
  });
});
