import * as pot from "@pagopa/ts-commons/lib/pot";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Alert } from "react-native";
import { channel } from "redux-saga";
import {
  call,
  cancel,
  delay,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest
} from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { UserDataProcessingChoiceEnum } from "../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../definitions/backend/UserDataProcessingStatus";
import { BackendClient } from "../api/backend";
import { apiUrlPrefix, zendeskEnabled } from "../config";
import { authenticationSaga } from "../features/authentication/common/saga/authenticationSaga";
import { loadSessionInformationSaga } from "../features/authentication/common/saga/loadSessionInformationSaga";
import {
  checkSession,
  watchCheckSessionSaga
} from "../features/authentication/common/saga/watchCheckSessionSaga";
import { watchLogoutSaga } from "../features/authentication/common/saga/watchLogoutSaga";
import { watchSessionExpiredSaga } from "../features/authentication/common/saga/watchSessionExpiredSaga";
import { sessionExpired } from "../features/authentication/common/store/actions";
import {
  sessionInfoSelector,
  sessionTokenSelector
} from "../features/authentication/common/store/selectors";
import { setSecurityAdviceReadyToShow } from "../features/authentication/fastLogin/store/actions/securityAdviceActions";
import { refreshSessionToken } from "../features/authentication/fastLogin/store/actions/tokenRefreshActions";
import {
  isFastLoginEnabledSelector,
  tokenRefreshSelector
} from "../features/authentication/fastLogin/store/selectors";
import { shouldTrackLevelSecurityMismatchSaga } from "../features/authentication/login/cie/sagas/trackLevelSecuritySaga";
import { userFromSuccessLoginSelector } from "../features/authentication/loginInfo/store/selectors";
import { watchBonusCgnSaga } from "../features/bonus/cgn/saga";
import { watchFciSaga } from "../features/fci/saga";
import { watchFimsSaga } from "../features/fims/common/saga";
import { startAndReturnIdentificationResult } from "../features/identification/sagas";
import { IdentificationResult } from "../features/identification/store/reducers";
import { watchIDPaySaga } from "../features/idpay/common/saga";
import {
  isDeviceOfflineWithWalletSaga,
  watchSessionRefreshInOfflineSaga
} from "../features/ingress/saga";
import { isBlockingScreenSelector } from "../features/ingress/store/selectors";
import {
  watchItwOfflineSaga,
  watchItwSaga
} from "../features/itwallet/common/saga";
import { checkPublicKeyAndBlockIfNeeded } from "../features/lollipop/navigation";
import {
  checkLollipopSessionAssertionAndInvalidateIfNeeded,
  generateLollipopKeySaga,
  getKeyInfo
} from "../features/lollipop/saga";
import { lollipopPublicKeySelector } from "../features/lollipop/store/reducers/lollipop";
import { handleIsKeyStrongboxBacked } from "../features/lollipop/utils/crypto";
import { checkAcknowledgedEmailSaga } from "../features/mailCheck/sagas/checkAcknowledgedEmailSaga";
import { watchEmailNotificationPreferencesSaga } from "../features/mailCheck/sagas/checkEmailNotificationPreferencesSaga";
import { checkEmailSaga } from "../features/mailCheck/sagas/checkEmailSaga";
import { watchEmailValidationSaga } from "../features/mailCheck/sagas/emailValidationPollingSaga";
import { watchProfileEmailValidationChangedSaga } from "../features/mailCheck/sagas/watchProfileEmailValidationChangedSaga";
import { watchMessagesSaga } from "../features/messages/saga";
import { handleClearAllAttachments } from "../features/messages/saga/handleClearAttachments";
import { checkAcknowledgedFingerprintSaga } from "../features/onboarding/saga/biometric/checkAcknowledgedFingerprintSaga";
import { completeOnboardingSaga } from "../features/onboarding/saga/completeOnboardingSaga";
import { watchAbortOnboardingSaga } from "../features/onboarding/saga/watchAbortOnboardingSaga";
import { watchPaymentsSaga } from "../features/payments/common/saga";
import { watchPnSaga } from "../features/pn/store/sagas/watchPnSaga";
import { handlePendingMessageStateIfAllowed } from "../features/pushNotifications/sagas/common";
import { notificationPermissionsListener } from "../features/pushNotifications/sagas/notificationPermissionsListener";
import { profileAndSystemNotificationsPermissions } from "../features/pushNotifications/sagas/profileAndSystemNotificationsPermissions";
import { pushNotificationTokenUpload } from "../features/pushNotifications/sagas/pushNotificationTokenUpload";
import { cancellAllLocalNotifications } from "../features/pushNotifications/utils";
import { watchServicesSaga } from "../features/services/common/saga";
import { fetchServicePreferencesForStartup } from "../features/services/details/saga/handleGetServicePreference";
import {
  loadProfile,
  watchProfile,
  watchProfileRefreshRequestsSaga,
  watchProfileUpsertRequestsSaga
} from "../features/settings/common/sagas/profile";
import { watchUserDataProcessingSaga } from "../features/settings/common/sagas/userDataProcessing";
import { resetProfileState } from "../features/settings/common/store/actions";
import { loadUserDataProcessing } from "../features/settings/common/store/actions/userDataProcessing";
import { profileSelector } from "../features/settings/common/store/selectors";
import { isProfileFirstOnBoarding } from "../features/settings/common/store/utils/guards";
import { handleApplicationStartupTransientError } from "../features/startup/sagas";
import { watchTrialSystemSaga } from "../features/trialSystem/store/sagas/watchTrialSystemSaga";
import { watchWalletSaga } from "../features/wallet/saga";
import {
  watchGetZendeskTokenSaga,
  watchZendeskGetSessionSaga
} from "../features/zendesk/saga";
import { formatRequestedTokenString } from "../features/zendesk/utils";
import I18n from "../i18n";
import { mixpanelTrack } from "../mixpanel";
import NavigationService from "../navigation/NavigationService";
import {
  applicationInitialized,
  startApplicationInitialization
} from "../store/actions/application";
import { backendStatusLoadSuccess } from "../store/actions/backendStatus";
import { differentProfileLoggedIn } from "../store/actions/crossSessions";
import { setMixpanelEnabled } from "../store/actions/mixpanel";
import { navigateToPrivacyScreen } from "../store/actions/navigation";
import {
  startupLoadSuccess,
  startupTransientError
} from "../store/actions/startup";
import {
  isIdPayEnabledSelector,
  isPnRemoteEnabledSelector,
  remoteConfigSelector
} from "../store/reducers/backendStatus/remoteConfig";
import {
  StartupStatusEnum,
  startupTransientErrorInitialState
} from "../store/reducers/startup";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { trackKeychainFailures } from "../utils/analytics";
import { isTestEnv } from "../utils/environment";
import { getPin } from "../utils/keychain";
import { previousInstallationDataDeleteSaga } from "./installation";
import {
  askMixpanelOptIn,
  handleSetMixpanelEnabled,
  initMixpanel,
  watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel
} from "./mixpanel";
import { setLanguageFromProfileIfExists } from "./preferences";
import { askServicesPreferencesModeOptin } from "./services/servicesOptinSaga";
import { checkAppHistoryVersionSaga } from "./startup/appVersionHistorySaga";
import { checkAcceptedTosSaga } from "./startup/checkAcceptedTosSaga";
import { checkConfiguredPinSaga } from "./startup/checkConfiguredPinSaga";
import { checkItWalletIdentitySaga } from "./startup/checkItWalletIdentitySaga";
import { checkProfileEnabledSaga } from "./startup/checkProfileEnabledSaga";

export const WAIT_INITIALIZE_SAGA = 5000 as Millisecond;
const navigatorPollingTime = 125 as Millisecond;
const warningWaitNavigatorTime = 2000 as Millisecond;

/**
 * Handles the application startup and the main application logic loop
 */
/**
 * The startup saga is triggered in the following scenarios:
 * - During the root saga initialization
 * - On logout or expired session
 * - On FL session refresh
 * - When accessing the Wallet mini app in offline mode
 */
// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
export function* initializeApplicationSaga(
  startupAction?: ActionType<typeof startApplicationInitialization>
): Generator<ReduxSagaEffect, void, any> {
  // LV
  const handleSessionExpiration = !!(
    startupAction?.payload && startupAction.payload.handleSessionExpiration
  );
  const showIdentificationModal =
    startupAction?.payload?.showIdentificationModalAtStartup ?? true;
  // Remove explicitly previous session data. This is done as completion of two
  // use cases:
  // 1. Logout with data reset
  // 2. FIXME: as a workaround for iOS only. Below iOS version 12.3 Keychain is
  //           not cleared between one installation and another, so it is
  //           needed to manually clear previous installation user info in
  //           order to force the user to choose unlock code and run through onboarding
  //           every new installation.

  // store the app version in the history, if the current version is not present
  yield* call(checkAppHistoryVersionSaga);
  // check if mixpanel could be initialized
  yield* call(initMixpanel);
  yield* call(waitForNavigatorServiceInitialization);

  // remove all local notifications (see function comment)
  yield* call(cancellAllLocalNotifications);
  yield* call(previousInstallationDataDeleteSaga); // consider to move out of the startup saga

  // listen for mixpanel enabling events
  yield* takeLatest(setMixpanelEnabled, handleSetMixpanelEnabled);

  // clear cached downloads when the logged user changes
  yield* takeEvery(differentProfileLoggedIn, handleClearAllAttachments); // Consider using takeLatest here instead
  // Retrieve and listen for notification permissions status changes
  yield* fork(notificationPermissionsListener);

  /**
   * Get last logged in Profile from the state
   */
  const lastLoggedInProfileState: ReturnType<typeof profileSelector> =
    yield* select(profileSelector);

  const lastEmailValidated = pot.isSome(lastLoggedInProfileState)
    ? O.fromNullable(lastLoggedInProfileState.value.is_email_validated)
    : O.none;

  /**
   * Watch for profile changes
   * TODO: https://pagopa.atlassian.net/browse/IOPID-3040
   */
  yield* fork(watchProfileEmailValidationChangedSaga, lastEmailValidated);

  // Reset the profile cached in redux: at each startup we want to load a fresh
  // user profile.
  // Might be removable: https://github.com/pagopa/io-app/pull/398/files#diff-8a5b2f3967d681b976fe673762bd1061f5b430130c880c1195b76af06362cf31
  // It was likely used by the old ingress screen to track check progress
  // If removed, ensure the condition `if (O.isNone(maybeUserProfile))` is preserved,
  // as it plays a key role in detecting uninitialized profiles.
  // TODO: https://pagopa.atlassian.net/browse/IOPID-3042

  if (!handleSessionExpiration) {
    yield* put(resetProfileState()); // Consider identifying all scenarios where the profile should be reset (e.g. Wallet offline).
    // It might be worth consolidating them into a single function
  }

  // We need to generate a key in the application startup flow
  // to use this information on old app version already logged in users.
  // Here we are blocking the application startup, but we have the
  // the profile loading spinner active.

  // Consider extracting this logic, for example into the root saga

  yield* call(generateLollipopKeySaga);

  // This saga must retrieve the publicKey by its own,
  // since it must make sure to have the latest in-memory value
  // (as an example, during the authentication saga the key may have been regenerated multiple times)
  // #LOLLIPOP_CHECK_BLOCK1_START
  const unsupportedDevice = yield* call(checkPublicKeyAndBlockIfNeeded);
  if (unsupportedDevice) {
    return;
  }
  // #LOLLIPOP_CHECK_BLOCK1_END

  // Start watching for ITW sagas that do not require internet connection or a valid session
  yield* fork(watchItwOfflineSaga);

  /**
   * Prevents the saga from executing if the user opened the app while offline.
   *
   * - Calls `isDeviceOfflineWithWalletSaga` to determine if the device is offline,
   *   the user has a valid IT Wallet instance, and offline access is enabled.
   * - If this condition is met, it means the app started in offline mode,
   *   so the function exits early (`return`), preventing unnecessary execution of subsequent logic.
   * - This ensures that only relevant flows are triggered based on the app’s startup condition.
   */
  const isDeviceOfflineWithWallet = yield* call(isDeviceOfflineWithWalletSaga);
  if (isDeviceOfflineWithWallet) {
    return;
  }

  /**
   * Starts listening for session refresh failures while in offline mode.
   *
   * - `watchSessionRefreshInOfflineSaga` monitors when the offline access reason
   *   is updated due to a session refresh failure.
   * - If the session refresh process fails while offline, this saga will handle
   *   transitioning the app to offline mode accordingly.
   * - Forking (`yield* fork(...)`) allows this watcher to run in parallel
   *   without blocking the rest of the execution.
   *
   * This ensures that if the device is online but session refresh fails,
   * the app correctly transitions to offline mode when necessary.
   */
  yield* fork(watchSessionRefreshInOfflineSaga);

  // Since the backend.json is done in parallel with the startup saga,
  // we need to synchronize the two tasks, to be sure to have loaded the remote FF
  // before using them.
  const remoteConfig = yield* select(remoteConfigSelector);
  if (O.isNone(remoteConfig)) {
    yield* take(backendStatusLoadSuccess);
  }

  // ingress screen
  const isBlockingScreen = yield* select(isBlockingScreenSelector);
  if (isBlockingScreen) {
    return;
  }

  // Whether the user is currently logged in.
  const previousSessionToken: ReturnType<typeof sessionTokenSelector> =
    yield* select(sessionTokenSelector);

  // workaround to send keychainError
  // TODO: REMOVE AFTER FIXING https://pagopa.atlassian.net/jira/software/c/projects/IABT/boards/92?modal=detail&selectedIssue=IABT-1441
  yield* call(trackKeychainFailures);

  // Unless we have a valid session token already, login until we have one.
  const sessionToken: SagaCallReturnType<typeof authenticationSaga> =
    previousSessionToken
      ? previousSessionToken
      : yield* call(authenticationSaga);

  // BE CAREFUL where you get lollipop keyInfo.
  // They MUST be placed after authenticationSaga, because they are regenerated with each login attempt.
  // Get keyInfo for lollipop

  const keyInfo = yield* call(getKeyInfo);

  // Handles the expiration of the session token
  yield* fork(watchSessionExpiredSaga);
  yield* fork(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel);

  // Instantiate a backend client from the session token
  const backendClient: ReturnType<typeof BackendClient> = BackendClient(
    apiUrlPrefix,
    sessionToken,
    keyInfo
  );

  // The following functions all rely on backendClient

  // Now this saga (watchLogoutSaga) is launched using `fork` instead of `spawn`,
  // meaning it is tied to the lifecycle of the parent saga (`startupSaga`).

  // watchLogoutSaga is launched using `fork` so that it will be cancelled
  // if the parent saga (`startupSaga`) is cancelled or restarted
  // (e.g. on session expiration or when coming back online).

  // Originally the logic with spawn was introduced in this PR: https://github.com/pagopa/io-app/pull/1417
  // to ensure the logout listener remained active independently.
  // Now changed to `fork` to better align with the parent lifecycle.

  // Watch for requests to logout
  // This saga handles user state cleanup during logout.
  yield* fork(watchLogoutSaga, backendClient.logout);

  if (zendeskEnabled) {
    yield* fork(watchZendeskGetSessionSaga, backendClient.getSession);
  }

  // check if the current session is still valid
  const checkSessionResponse: SagaCallReturnType<typeof checkSession> =
    yield* call(
      checkSession,
      backendClient.getSession,
      formatRequestedTokenString()
    );

  if (checkSessionResponse === 401) {
    // This is the first API call we make to the backend, it may happen that
    // when we're using the previous session token, that session has expired
    // so we need to reset the session token and restart from scratch.
    const isFastLoginEnabled = yield* select(isFastLoginEnabledSelector);
    if (!isFastLoginEnabled) {
      yield* put(sessionExpired());
    } else {
      yield* put(
        refreshSessionToken.request({
          withUserInteraction: false,
          showIdentificationModalAtStartup: true,
          showLoader: false
        })
      );
    }
    return;
  }

  // Now we fork the tasks that will handle the async requests coming from the
  // UI of the application.
  // Note that the following sagas will be automatically cancelled each time
  // this parent saga gets restarted.

  yield* fork(
    watchUserDataProcessingSaga,
    backendClient.getUserDataProcessingRequest,
    backendClient.postUserDataProcessingRequest,
    backendClient.deleteUserDataProcessingRequest
  );

  // The logic below relies on the current active session
  // and is maintained by separate teams

  // Start watching for Services actions
  yield* fork(watchServicesSaga, backendClient, sessionToken);

  // Start watching for Messages actions
  yield* fork(watchMessagesSaga, backendClient, sessionToken);

  // start watching for FIMS actions
  yield* fork(watchFimsSaga, sessionToken);

  // watch FCI saga
  yield* fork(watchFciSaga, sessionToken, keyInfo);

  // whether we asked the user to login again
  const isSessionRefreshed = previousSessionToken !== sessionToken; // Needs further investigation

  // Let's see if have to load the session info, either because
  // we don't have one for the current session or because we
  // just refreshed the session.
  // FIXME: since it looks like we load the session info every
  //        time we get a session token, think about merging the
  //        two steps.
  // eslint-disable-next-line functional/no-let
  let maybeSessionInformation: ReturnType<typeof sessionInfoSelector> =
    yield* select(sessionInfoSelector);
  // In the check below we had also isSessionRefreshed, but it is not needed
  // since the actual checkSession made above is enough to ensure that the
  // session tokens are retrieved correctly.
  // Only in the scenario when we get here and session tokens are not available,
  // we have to load the session information from the backend.
  // In a future refactoring where the checkSession won't get the session tokens
  // anymore, we will need to rethink about this check.
  // **However**, this refactor depends on the saga startup integer refactor,
  // so it momentarily does not have a jira ticket assigned
  if (
    O.isNone(maybeSessionInformation) ||
    (O.isSome(maybeSessionInformation) &&
      (maybeSessionInformation.value.bpdToken === undefined ||
        maybeSessionInformation.value.walletToken === undefined))
  ) {
    // let's try to load the session information from the backend.

    maybeSessionInformation = yield* call(
      loadSessionInformationSaga,
      backendClient.getSession
    );

    if (
      O.isNone(maybeSessionInformation) ||
      (O.isSome(maybeSessionInformation) &&
        (maybeSessionInformation.value.bpdToken === undefined ||
          maybeSessionInformation.value.walletToken === undefined))
    ) {
      yield* call(handleApplicationStartupTransientError, "GET_SESSION_DOWN");
      return;
    }
  }

  const userFromSuccessLogin = yield* select(userFromSuccessLoginSelector);

  if (userFromSuccessLogin) {
    yield* call(shouldTrackLevelSecurityMismatchSaga, maybeSessionInformation);
  }

  const publicKey = yield* select(lollipopPublicKeySelector);

  // #LOLLIPOP_CHECK_BLOCK2_START
  const isAssertionRefValid = yield* call(
    checkLollipopSessionAssertionAndInvalidateIfNeeded,
    publicKey,
    maybeSessionInformation
  );
  if (!isAssertionRefValid) {
    return;
  }
  // #LOLLIPOP_CHECK_BLOCK2_END

  // Start watching for profile update requests as the checkProfileEnabledSaga
  // may need to update the profile.
  yield* fork(
    watchProfileUpsertRequestsSaga,
    backendClient.createOrUpdateProfile
  );

  // Start watching when profile is successfully loaded
  yield* fork(watchProfile, backendClient.startEmailValidationProcess);

  // If we are here the user is logged in and the session info is
  // loaded and valid

  // Load the profile info
  const maybeUserProfile: SagaCallReturnType<typeof loadProfile> = yield* call(
    loadProfile,
    backendClient.getProfile
  );

  if (O.isNone(maybeUserProfile)) {
    yield* call(handleApplicationStartupTransientError, "GET_PROFILE_DOWN");
    return;
  }
  yield* put(startupTransientError(startupTransientErrorInitialState));

  // eslint-disable-next-line functional/no-let
  let userProfile = maybeUserProfile.value;

  // Retrieve the configured unlock code from the keychain
  const maybeStoredPin: SagaCallReturnType<typeof getPin> = yield* call(getPin);

  // Start watching for requests of refresh the profile
  yield* fork(watchProfileRefreshRequestsSaga, backendClient.getProfile);

  // Start watching for requests about session and support token
  yield* fork(
    watchCheckSessionSaga,
    backendClient.getSession,
    formatRequestedTokenString()
  );
  // Start watching for requests of abort the onboarding

  yield* fork(watchGetZendeskTokenSaga, backendClient.getSession);

  const watchAbortOnboardingSagaTask = yield* fork(watchAbortOnboardingSaga);

  // start onboarding
  yield* put(startupLoadSuccess(StartupStatusEnum.ONBOARDING));
  if (!handleSessionExpiration) {
    yield* call(waitForMainNavigator);
  }

  // yield* delay(0 as Millisecond);
  const hasPreviousSessionAndPin =
    previousSessionToken && O.isSome(maybeStoredPin);
  if (hasPreviousSessionAndPin && showIdentificationModal) {
    // we ask the user to identify using the unlock code.
    // FIXME: This is an unsafe cast caused by a wrongly described type.
    const identificationResult: SagaCallReturnType<
      typeof startAndReturnIdentificationResult
    > = yield* call(startAndReturnIdentificationResult, maybeStoredPin.value);

    if (identificationResult === IdentificationResult.pinreset) {
      // If we are here the user had chosen to reset the unlock code
      yield* put(startApplicationInitialization());
      return;
    }

    if (!handleSessionExpiration) {
      yield* call(setLanguageFromProfileIfExists);
    }

    const isFastLoginEnabled = yield* select(isFastLoginEnabledSelector);
    if (isFastLoginEnabled) {
      // At application startup, the state of the refresh token is "idle".
      // If we got a 401 in the above getSession we start a token refresh.
      // If we succeed, we can continue with the application startup and
      // we could skip this step.
      const lastTokenRefreshState = yield* select(tokenRefreshSelector);
      if (lastTokenRefreshState.kind !== "success") {
        yield* put(
          refreshSessionToken.request({
            withUserInteraction: false,
            showIdentificationModalAtStartup: false,
            showLoader: true
          })
        );
        return;
      }
    }
  }

  yield* call(fetchServicePreferencesForStartup);

  // Ask to accept ToS if there is a new available version
  yield* call(checkAcceptedTosSaga, userProfile);

  if (!handleSessionExpiration) {
    yield* call(setLanguageFromProfileIfExists);
  }
  // check if the user expressed preference about mixpanel, if not ask for it
  yield* call(askMixpanelOptIn);

  // track if the Android device has StrongBox
  yield* call(handleIsKeyStrongboxBacked, keyInfo.keyTag);

  yield* call(checkConfiguredPinSaga);
  yield* call(checkAcknowledgedFingerprintSaga);

  // email validation polling
  yield* fork(watchEmailValidationSaga);

  if (!hasPreviousSessionAndPin || userProfile.email === undefined) {
    yield* call(checkAcknowledgedEmailSaga, userProfile);
  }

  /**
   * if the checks fail (email already taken or email not validated) then the user
   * is sent back to the page that communicates the problem and from there if starts
   * the validation flow. If the user wants to validate the email the flow
   * that triggers polling begins (watchEmailValidationSaga)
   */
  userProfile = (yield* call(checkEmailSaga)) ?? userProfile;

  // Check for both profile notifications permissions (anonymous
  // content && reminder) and system notifications permissions.
  yield* call(profileAndSystemNotificationsPermissions, userProfile);

  const isFirstOnboarding = isProfileFirstOnBoarding(userProfile);
  yield* call(askServicesPreferencesModeOptin, isFirstOnboarding);

  if (isFirstOnboarding) {
    // Show the thank-you screen for the onboarding
    yield* call(completeOnboardingSaga);
  }

  // finish the onboarding
  // Stop the watchAbortOnboardingSaga
  yield* cancel(watchAbortOnboardingSagaTask);

  // Fork the saga that uploads the push notification token to the backend.
  // At this moment, the push notification token may not be available yet but
  // the saga handles it internally. Make sure to fork it and not call it using
  // a blocking call, since the saga will just hang, waiting for the token
  yield* fork(
    pushNotificationTokenUpload,
    backendClient.createOrUpdateInstallation
  );

  // This saga is called before the startup status is set to authenticated to avoid flashing
  // the home screen when the user is taken to the alert screen in case of identities that don't match.
  yield* call(checkItWalletIdentitySaga);

  yield* put(startupLoadSuccess(StartupStatusEnum.AUTHENTICATED));
  //
  // User is autenticated, session token is valid
  //
  // Start wathing new wallet sagas
  yield* fork(watchWalletSaga);

  // Here we can be sure that the session information is loaded and valid
  const bpdToken = maybeSessionInformation.value.bpdToken as string;

  // Start watching for cgn actions
  yield* fork(watchBonusCgnSaga, sessionToken);

  const pnEnabled: ReturnType<typeof isPnRemoteEnabledSelector> = yield* select(
    isPnRemoteEnabledSelector
  );

  if (pnEnabled) {
    // Start watching for PN actions
    yield* fork(watchPnSaga, sessionToken);
  }

  const idPayEnabled: ReturnType<typeof isIdPayEnabledSelector> = yield* select(
    isIdPayEnabledSelector
  );

  if (idPayEnabled) {
    // Start watching for IDPay actions
    yield* fork(watchIDPaySaga, bpdToken);
  }

  // Start watching for trial system saga
  yield* fork(watchTrialSystemSaga, sessionToken);

  // Start watching for itw saga
  yield* fork(watchItwSaga);

  // Here we can be sure that the session information is loaded and valid
  const walletToken = maybeSessionInformation.value.walletToken as string;
  // Start watching for Wallet V3 actions
  yield* fork(watchPaymentsSaga, walletToken);

  // Check that profile is up to date (e.g. inbox enabled)
  yield* call(checkProfileEnabledSaga, userProfile);

  if (isSessionRefreshed) {
    // Only if the user are logging in check the account removal status and,
    // if is PENDING show an alert to notify him.
    const checkUserDeletePendingTask: any = yield* takeLatest(
      loadUserDataProcessing.success,
      function* (
        loadUserDataProcessingSuccess: ActionType<
          typeof loadUserDataProcessing.success
        >
      ) {
        const maybeDeletePending = pipe(
          loadUserDataProcessingSuccess.payload.value,
          O.fromNullable,
          O.filter(
            uc =>
              uc.choice === UserDataProcessingChoiceEnum.DELETE &&
              uc.status === UserDataProcessingStatusEnum.PENDING
          )
        );
        type leftOrRight = "left" | "right";
        const alertChoiceChannel = channel<leftOrRight>();

        if (O.isSome(maybeDeletePending)) {
          Alert.alert(
            I18n.t("startup.userDeletePendingAlert.title"),
            I18n.t("startup.userDeletePendingAlert.message"),
            [
              {
                text: I18n.t("startup.userDeletePendingAlert.cta_1"),
                style: "cancel",
                onPress: () => {
                  alertChoiceChannel.put("left");
                }
              },
              {
                text: I18n.t("startup.userDeletePendingAlert.cta_2"),
                style: "default",
                onPress: () => {
                  alertChoiceChannel.put("right");
                }
              }
            ],
            { cancelable: false }
          );
          const action: leftOrRight = yield* take(alertChoiceChannel);
          if (action === "left") {
            yield* call(navigateToPrivacyScreen);
          }
          yield* cancel(checkUserDeletePendingTask);
        }
      }
    );

    yield* put(
      loadUserDataProcessing.request(UserDataProcessingChoiceEnum.DELETE)
    );
  }

  // Watch for checking the user email notifications preferences
  yield* fork(watchEmailNotificationPreferencesSaga);

  // Check if we have a pending notification message
  yield* call(handlePendingMessageStateIfAllowed, true);

  // This tells the security advice bottomsheet that it can be shown
  yield* put(setSecurityAdviceReadyToShow(true));

  yield* put(
    applicationInitialized({
      actionsToWaitFor: []
    })
  );
}

/**
 * Wait until the {@link NavigationService} is initialized.
 * The NavigationService is initialized when is called {@link RootContainer} componentDidMount and the ref is set with setTopLevelNavigator
 * Consider moving this to a dedicated file.
 * TODO: https://pagopa.atlassian.net/browse/IOPID-3041
 */
function* waitForNavigatorServiceInitialization() {
  // eslint-disable-next-line functional/no-let
  let isNavigatorReady: ReturnType<
    typeof NavigationService.getIsNavigationReady
  > = yield* call(NavigationService.getIsNavigationReady);

  // eslint-disable-next-line functional/no-let
  let timeoutLogged = false;

  const startTime = performance.now();

  // before continuing we must wait for the navigatorService to be ready
  while (!isNavigatorReady) {
    const elapsedTime = performance.now() - startTime;
    if (!timeoutLogged && elapsedTime >= warningWaitNavigatorTime) {
      timeoutLogged = true;

      yield* call(mixpanelTrack, "NAVIGATION_SERVICE_INITIALIZATION_TIMEOUT");
    }
    yield* delay(navigatorPollingTime);
    isNavigatorReady = yield* call(NavigationService.getIsNavigationReady);
  }

  const initTime = performance.now() - startTime;

  yield* call(mixpanelTrack, "NAVIGATION_SERVICE_INITIALIZATION_COMPLETED", {
    elapsedTime: initTime
  });
}

// Consider moving this to a dedicated file
// TODO: https://pagopa.atlassian.net/browse/IOPID-3041

function* waitForMainNavigator() {
  // eslint-disable-next-line functional/no-let
  let isMainNavReady = yield* call(NavigationService.getIsMainNavigatorReady);

  // eslint-disable-next-line functional/no-let
  let timeoutLogged = false;
  const startTime = performance.now();

  // before continuing we must wait for the main navigator tack to be ready
  while (!isMainNavReady) {
    const elapsedTime = performance.now() - startTime;
    if (!timeoutLogged && elapsedTime >= warningWaitNavigatorTime) {
      timeoutLogged = true;

      yield* call(mixpanelTrack, "MAIN_NAVIGATOR_STACK_READY_TIMEOUT");
    }
    yield* delay(navigatorPollingTime);
    isMainNavReady = yield* call(NavigationService.getIsMainNavigatorReady);
  }

  const initTime = performance.now() - startTime;

  yield* call(mixpanelTrack, "MAIN_NAVIGATOR_STACK_READY_OK", {
    elapsedTime: initTime
  });
}

export function* startupSaga(): IterableIterator<ReduxSagaEffect> {
  // Wait until the IngressScreen gets mounted
  yield* takeLatest(
    getType(startApplicationInitialization),
    initializeApplicationSaga
  );
}

export const testWaitForNavigatorServiceInitialization = isTestEnv
  ? waitForNavigatorServiceInitialization
  : undefined;
