import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import mockedProfile from "../../__mocks__/initializedProfile";

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
import {
  initMixpanel,
  watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel
} from "../mixpanel";
import {
  loadProfile,
  watchProfile,
  watchProfileUpsertRequestsSaga
} from "../profile";
import {
  initializeApplicationSaga,
  testCancellAllLocalNotifications,
  testWaitForNavigatorServiceInitialization
} from "../startup";
import { watchSessionExpiredSaga } from "../startup/watchSessionExpiredSaga";
import { watchProfileEmailValidationChangedSaga } from "../watchProfileEmailValidationChangedSaga";
import { checkAppHistoryVersionSaga } from "../startup/appVersionHistorySaga";
import {
  generateLollipopKeySaga,
  getKeyInfo
} from "../../features/lollipop/saga";
import { lollipopPublicKeySelector } from "../../features/lollipop/store/reducers/lollipop";
import { startupLoadSuccess } from "../../store/actions/startup";
import { StartupStatusEnum } from "../../store/reducers/startup";
import { isFastLoginEnabledSelector } from "../../features/fastLogin/store/selectors";
import { refreshSessionToken } from "../../features/fastLogin/store/actions/tokenRefreshActions";
import { backendStatusSelector } from "../../store/reducers/backendStatus";
import { watchLogoutSaga } from "../startup/watchLogoutSaga";

const aSessionToken = "a_session_token" as SessionToken;

jest.mock("react-native-background-timer", () => ({
  startTimer: jest.fn()
}));

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

jest.mock("../../api/backend", () => ({
  BackendClient: jest.fn().mockReturnValue({})
}));

const profile: InitializedProfile = {
  ...mockedProfile,
  is_email_enabled: false,
  is_email_validated: undefined
};

describe("initializeApplicationSaga", () => {
  it("should dispatch startApplicationInitialization if check session response is 200 but session is none", () => {
    testSaga(initializeApplicationSaga)
      .next()
      .call(checkAppHistoryVersionSaga)
      .next()
      .call(initMixpanel)
      .next()
      .call(testWaitForNavigatorServiceInitialization!)
      .next()
      .call(testCancellAllLocalNotifications!)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .put(previousInstallationDataDeleteSuccess())
      .next()
      .next()
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, O.none)
      .next()
      .put(resetProfileState())
      .next()
      .next(generateLollipopKeySaga)
      .next(false) // unsupported device
      .select(backendStatusSelector)
      .next(O.some({}))
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .next(getKeyInfo)
      .fork(watchSessionExpiredSaga)
      .next()
      .fork(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel)
      .next()
      .spawn(watchLogoutSaga, undefined)
      .next()
      .next(200) // checkSession
      .next()
      .next()
      .next()
      .next()
      .next()
      .next()
      .select(sessionInfoSelector)
      .next(O.none)
      .next(O.none) // loadSessionInformationSaga
      .put(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED))
      .next()
      .put(startApplicationInitialization());
  });

  it("should dispatch sessionExpired if check session response is 401 & FastLogin disabled", () => {
    testSaga(initializeApplicationSaga)
      .next()
      .call(checkAppHistoryVersionSaga)
      .next()
      .call(initMixpanel)
      .next()
      .call(testWaitForNavigatorServiceInitialization!)
      .next()
      .call(testCancellAllLocalNotifications!)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .put(previousInstallationDataDeleteSuccess())
      .next()
      .next()
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, O.none)
      .next(pot.some(profile))
      .put(resetProfileState())
      .next()
      .next(generateLollipopKeySaga)
      .next(false) // unsupported device
      .select(backendStatusSelector)
      .next(O.some({}))
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .next(getKeyInfo)
      .fork(watchSessionExpiredSaga)
      .next()
      .fork(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel)
      .next()
      .spawn(watchLogoutSaga, undefined)
      .next()
      .next(401) // checksession
      .select(isFastLoginEnabledSelector)
      .next(false) // FastLogin FF
      .put(sessionExpired());
  });

  it("should dispatch refreshTokenRequest if check session response is 401 & FastLogin enabled", () => {
    testSaga(initializeApplicationSaga)
      .next()
      .call(checkAppHistoryVersionSaga)
      .next()
      .call(initMixpanel)
      .next()
      .call(testWaitForNavigatorServiceInitialization!)
      .next()
      .call(testCancellAllLocalNotifications!)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .put(previousInstallationDataDeleteSuccess())
      .next()
      .next()
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, O.none)
      .next(pot.some(profile))
      .put(resetProfileState())
      .next()
      .next(generateLollipopKeySaga)
      .next(false) // unsupported device
      .select(backendStatusSelector)
      .next(O.some({}))
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .next(getKeyInfo)
      .fork(watchSessionExpiredSaga)
      .next()
      .fork(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel)
      .next()
      .spawn(watchLogoutSaga, undefined)
      .next()
      .next(401) // checksession
      .next(true) // FastLogin FF
      .put(
        refreshSessionToken.request({
          withUserInteraction: false,
          showIdentificationModalAtStartup: true,
          showLoader: false
        })
      );
  });

  it("should dispatch loadprofile if installation id response is 200 and session is still valid", () => {
    testSaga(initializeApplicationSaga)
      .next()
      .call(checkAppHistoryVersionSaga)
      .next()
      .call(initMixpanel)
      .next()
      .call(testWaitForNavigatorServiceInitialization!)
      .next()
      .call(testCancellAllLocalNotifications!)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .put(previousInstallationDataDeleteSuccess())
      .next()
      .next()
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, O.none)
      .next(pot.some(profile))
      .put(resetProfileState())
      .next()
      .next(generateLollipopKeySaga)
      .next(false) // unsupported device
      .select(backendStatusSelector)
      .next(O.some({}))
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .next(getKeyInfo)
      .fork(watchSessionExpiredSaga)
      .next()
      .fork(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel)
      .next()
      .spawn(watchLogoutSaga, undefined)
      .next()
      .next(200) // check session
      .next()
      .next()
      .next()
      .next()
      .next()
      .next()
      .select(sessionInfoSelector)
      .next(
        O.some({
          spidLevel: "https://www.spid.gov.it/SpidL2",
          walletToken: "wallet_token"
        })
      )
      .next(lollipopPublicKeySelector)
      .next(true) // assertionRef is valid
      .fork(watchProfileUpsertRequestsSaga, undefined)
      .next()
      .fork(watchProfile, undefined)
      .next()
      .call(loadProfile, undefined);
  });
});
