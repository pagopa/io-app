import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import mockedProfile from "../../__mocks__/initializedProfile";

import { sessionExpired } from "../../features/authentication/common/store/actions";
import { resetProfileState } from "../../features/settings/common/store/actions";
import {
  sessionInfoSelector,
  sessionTokenSelector
} from "../../features/authentication/common/store/selectors";
import { profileSelector } from "../../features/settings/common/store/selectors";
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
} from "../../features/settings/common/sagas/profile";
import {
  initializeApplicationSaga,
  testWaitForNavigatorServiceInitialization
} from "../startup";
import { watchSessionExpiredSaga } from "../../features/authentication/common/saga/watchSessionExpiredSaga";
import { watchProfileEmailValidationChangedSaga } from "../../features/mailCheck/sagas/watchProfileEmailValidationChangedSaga";
import { checkAppHistoryVersionSaga } from "../startup/appVersionHistorySaga";
import {
  checkLollipopSessionAssertionAndInvalidateIfNeeded,
  generateLollipopKeySaga,
  getKeyInfo
} from "../../features/lollipop/saga";
import { lollipopPublicKeySelector } from "../../features/lollipop/store/reducers/lollipop";
import { isFastLoginEnabledSelector } from "../../features/authentication/fastLogin/store/selectors";
import { refreshSessionToken } from "../../features/authentication/fastLogin/store/actions/tokenRefreshActions";
import { remoteConfigSelector } from "../../store/reducers/backendStatus/remoteConfig";
import { watchLogoutSaga } from "../../features/authentication/common/saga/watchLogoutSaga";
import { cancellAllLocalNotifications } from "../../features/pushNotifications/utils";
import { handleApplicationStartupTransientError } from "../../features/startup/sagas";
import { startupTransientErrorInitialState } from "../../store/reducers/startup";
import { isBlockingScreenSelector } from "../../features/ingress/store/selectors";
import { notificationPermissionsListener } from "../../features/pushNotifications/sagas/notificationPermissionsListener";
import { trackKeychainFailures } from "../../utils/analytics";
import { checkSession } from "../../features/authentication/common/saga/watchCheckSessionSaga";
import { formatRequestedTokenString } from "../../features/zendesk/utils";
import { checkPublicKeyAndBlockIfNeeded } from "../../features/lollipop/navigation";
import { userFromSuccessLoginSelector } from "../../features/authentication/loginInfo/store/selectors";
import { watchItwOfflineSaga } from "../../features/itwallet/common/saga";
import {
  isDeviceOfflineWithWalletSaga,
  watchSessionRefreshInOfflineSaga
} from "../../features/ingress/saga";

const aSessionToken = "a_session_token" as SessionToken;
const aSessionInfo = O.some({
  spidLevel: "https://www.spid.gov.it/SpidL2",
  walletToken: "wallet_token",
  bpdToken: "bpd_token"
});
const anEmptySessionInfo = O.some({
  spidLevel: "https://www.spid.gov.it/SpidL2"
});
const aPublicKey = O.some({
  crv: "P_256",
  kty: "EC",
  x: "nDbpq45jXUKfWxodyvec3F1e+r0oTSqhakbauVmB59Y=",
  y: "CtI6Cozk4O5OJ4Q6WyjiUw9/K6TyU0aDdssd25YHZxg="
});

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
  it("should call handleTransientError if check session response is 200 but session is none", () => {
    testSaga(initializeApplicationSaga)
      .next()
      .call(checkAppHistoryVersionSaga)
      .next()
      .call(initMixpanel)
      .next()
      .call(testWaitForNavigatorServiceInitialization!)
      .next()
      .call(cancellAllLocalNotifications)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .next()
      .next()
      .fork(notificationPermissionsListener)
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, O.none)
      .next()
      .put(resetProfileState())
      .next()
      .next(generateLollipopKeySaga)
      .call(checkPublicKeyAndBlockIfNeeded) // is device unsupported?
      .next(false) // the device is supported
      .fork(watchItwOfflineSaga)
      .next()
      .call(isDeviceOfflineWithWalletSaga)
      .next()
      .fork(watchSessionRefreshInOfflineSaga)
      .next()
      .select(remoteConfigSelector)
      .next(O.some({}))
      .select(isBlockingScreenSelector)
      .next()
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .next(trackKeychainFailures)
      .next(getKeyInfo)
      .fork(watchSessionExpiredSaga)
      .next()
      .fork(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel)
      .next()
      .fork(watchLogoutSaga, undefined)
      .next()
      .next(200) // checkSession
      .next()
      .next()
      .next()
      .next()
      .next()
      .select(sessionInfoSelector)
      .next(O.none)
      .next(O.none) // loadSessionInformationSaga
      .next(handleApplicationStartupTransientError)
      .next(startupTransientErrorInitialState);
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
      .call(cancellAllLocalNotifications)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .next()
      .next()
      .fork(notificationPermissionsListener)
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, O.none)
      .next(pot.some(profile))
      .put(resetProfileState())
      .next()
      .next(generateLollipopKeySaga)
      .call(checkPublicKeyAndBlockIfNeeded) // is device unsupported?
      .next(false) // the device is supported
      .fork(watchItwOfflineSaga)
      .next()
      .call(isDeviceOfflineWithWalletSaga)
      .next()
      .fork(watchSessionRefreshInOfflineSaga)
      .next()
      .select(remoteConfigSelector)
      .next(O.some({}))
      .select(isBlockingScreenSelector)
      .next()
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .next(trackKeychainFailures)
      .next(getKeyInfo)
      .fork(watchSessionExpiredSaga)
      .next()
      .fork(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel)
      .next()
      .fork(watchLogoutSaga, undefined)
      .next()
      .call(checkSession, undefined, formatRequestedTokenString())
      .next(401)
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
      .call(cancellAllLocalNotifications)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .next()
      .next()
      .fork(notificationPermissionsListener)
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, O.none)
      .next(pot.some(profile))
      .put(resetProfileState())
      .next()
      .next(generateLollipopKeySaga)
      .call(checkPublicKeyAndBlockIfNeeded) // is device unsupported?
      .next(false) // the device is supported
      .fork(watchItwOfflineSaga)
      .next()
      .call(isDeviceOfflineWithWalletSaga)
      .next()
      .fork(watchSessionRefreshInOfflineSaga)
      .next()
      .select(remoteConfigSelector)
      .next(O.some({}))
      .select(isBlockingScreenSelector)
      .next()
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .next(trackKeychainFailures)
      .next(getKeyInfo)
      .fork(watchSessionExpiredSaga)
      .next()
      .fork(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel)
      .next()
      .fork(watchLogoutSaga, undefined)
      .next()
      .call(checkSession, undefined, formatRequestedTokenString())
      .next(401)
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
      .call(cancellAllLocalNotifications)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .next()
      .next()
      .fork(notificationPermissionsListener)
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, O.none)
      .next(pot.some(profile))
      .put(resetProfileState())
      .next()
      .next(generateLollipopKeySaga)
      .call(checkPublicKeyAndBlockIfNeeded) // is device unsupported?
      .next(false) // the device is supported
      .fork(watchItwOfflineSaga)
      .next()
      .call(isDeviceOfflineWithWalletSaga)
      .next()
      .fork(watchSessionRefreshInOfflineSaga)
      .next()
      .select(remoteConfigSelector)
      .next(O.some({}))
      .select(isBlockingScreenSelector)
      .next()
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .next(trackKeychainFailures)
      .next(getKeyInfo)
      .fork(watchSessionExpiredSaga)
      .next()
      .fork(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel)
      .next()
      .fork(watchLogoutSaga, undefined)
      .next()
      .next(200) // check session
      .next()
      .next()
      .next()
      .next()
      .next()
      .select(sessionInfoSelector)
      .next(aSessionInfo)
      .select(userFromSuccessLoginSelector)
      .next()
      .select(lollipopPublicKeySelector)
      .next(aPublicKey)
      .call(
        checkLollipopSessionAssertionAndInvalidateIfNeeded,
        aPublicKey,
        aSessionInfo
      ) // assertionRef is valid?
      .next(true) // assertionRef is valid!
      .fork(watchProfileUpsertRequestsSaga, undefined)
      .next()
      .fork(watchProfile, undefined)
      .next()
      .call(loadProfile, undefined);
  });

  it("should dispatch handleApplicationStartupTransientError if session information is none", () => {
    testSaga(initializeApplicationSaga)
      .next()
      .call(checkAppHistoryVersionSaga)
      .next()
      .call(initMixpanel)
      .next()
      .call(testWaitForNavigatorServiceInitialization!)
      .next()
      .call(cancellAllLocalNotifications)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .next()
      .next()
      .fork(notificationPermissionsListener)
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, O.none)
      .next(pot.some(profile))
      .put(resetProfileState())
      .next()
      .next(generateLollipopKeySaga)
      .call(checkPublicKeyAndBlockIfNeeded) // is device unsupported?
      .next(false) // the device is supported
      .fork(watchItwOfflineSaga)
      .next()
      .call(isDeviceOfflineWithWalletSaga)
      .next()
      .fork(watchSessionRefreshInOfflineSaga)
      .next()
      .select(remoteConfigSelector)
      .next(O.some({}))
      .select(isBlockingScreenSelector)
      .next()
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .next(trackKeychainFailures)
      .next(getKeyInfo)
      .fork(watchSessionExpiredSaga)
      .next()
      .fork(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel)
      .next()
      .fork(watchLogoutSaga, undefined)
      .next()
      .next(200) // check session
      .next()
      .next()
      .next()
      .next()
      .next()
      .select(sessionInfoSelector)
      .next(O.none)
      .next(O.none)
      .call(handleApplicationStartupTransientError, "GET_SESSION_DOWN");
  });

  it("should dispatch handleApplicationStartupTransientError if session information is some but walletToken and bpdToken are missing", () => {
    testSaga(initializeApplicationSaga)
      .next()
      .call(checkAppHistoryVersionSaga)
      .next()
      .call(initMixpanel)
      .next()
      .call(testWaitForNavigatorServiceInitialization!)
      .next()
      .call(cancellAllLocalNotifications)
      .next()
      .call(previousInstallationDataDeleteSaga)
      .next()
      .next()
      .next()
      .fork(notificationPermissionsListener)
      .next()
      .select(profileSelector)
      .next(pot.some(profile))
      .fork(watchProfileEmailValidationChangedSaga, O.none)
      .next(pot.some(profile))
      .put(resetProfileState())
      .next()
      .next(generateLollipopKeySaga)
      .call(checkPublicKeyAndBlockIfNeeded) // is device unsupported?
      .next(false) // the device is supported
      .fork(watchItwOfflineSaga)
      .next()
      .call(isDeviceOfflineWithWalletSaga)
      .next()
      .fork(watchSessionRefreshInOfflineSaga)
      .next()
      .select(remoteConfigSelector)
      .next(O.some({}))
      .select(isBlockingScreenSelector)
      .next()
      .select(sessionTokenSelector)
      .next(aSessionToken)
      .next(trackKeychainFailures)
      .next(getKeyInfo)
      .fork(watchSessionExpiredSaga)
      .next()
      .fork(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel)
      .next()
      .fork(watchLogoutSaga, undefined)
      .next()
      .next(200) // check session
      .next()
      .next()
      .next()
      .next()
      .next()
      .select(sessionInfoSelector)
      .next(anEmptySessionInfo)
      .next(anEmptySessionInfo)
      .call(handleApplicationStartupTransientError, "GET_SESSION_DOWN");
  });
});
