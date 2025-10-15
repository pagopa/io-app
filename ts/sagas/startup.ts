import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { Alert } from "react-native";
import { channel } from "redux-saga";
import {
  call,
  cancel,
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
import { watchActiveSessionLoginSaga } from "../features/authentication/activeSessionLogin/saga";
import { authenticationSaga } from "../features/authentication/common/saga/authenticationSaga";
import { loadSessionInformationSaga } from "../features/authentication/common/saga/loadSessionInformationSaga";
import {
  checkSession,
  watchCheckSessionSaga
} from "../features/authentication/common/saga/watchCheckSessionSaga";
import {
  watchForceLogoutOnDifferentCF,
  watchForceLogoutSaga
} from "../features/authentication/common/saga/watchForceLogoutSaga";
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
import {
  IdentificationBackActionType,
  IdentificationResult
} from "../features/identification/store/reducers";
import { watchIDPaySaga } from "../features/idpay/common/saga";
import {
  shouldExitForOfflineAccess,
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
import { MESSAGES_ROUTES } from "../features/messages/navigation/routes";
import { watchMessagesSaga } from "../features/messages/saga";
import { handleClearAllAttachments } from "../features/messages/saga/handleClearAttachments";
import { checkAcknowledgedFingerprintSaga } from "../features/onboarding/saga/biometric/checkAcknowledgedFingerprintSaga";
import { completeOnboardingSaga } from "../features/onboarding/saga/completeOnboardingSaga";
import { watchAbortOnboardingSaga } from "../features/onboarding/saga/watchAbortOnboardingSaga";
import { watchPaymentsSaga } from "../features/payments/common/saga";
import { watchAarFlowSaga } from "../features/pn/aar/saga/watchAARFlowSaga";
import { isAAREnabled } from "../features/pn/aar/store/selectors";
import { watchPnSaga } from "../features/pn/store/sagas/watchPnSaga";
import { maybeHandlePendingBackgroundActions } from "../features/pushNotifications/sagas/common";
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
import { loadUserDataProcessing } from "../features/settings/common/store/actions/userDataProcessing";
import { isProfileFirstOnBoarding } from "../features/settings/common/store/utils/guards";
import { handleApplicationStartupTransientError } from "../features/startup/sagas";
import { watchTrialSystemSaga } from "../features/trialSystem/store/sagas/watchTrialSystemSaga";
import { watchWalletSaga } from "../features/wallet/saga";
import {
  watchGetZendeskTokenSaga,
  watchZendeskGetSessionSaga
} from "../features/zendesk/saga";
import { formatRequestedTokenString } from "../features/zendesk/utils";
import NavigationService from "../navigation/NavigationService";
import ROUTES from "../navigation/routes";
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
  isAARRemoteEnabled,
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
import { backendClientManager } from "../api/BackendClientManager";
import {
  waitForMainNavigator,
  waitForNavigatorServiceInitialization
} from "../navigation/saga/navigation";
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

  const isActiveLoginSuccessProp =
    startupAction?.payload?.isActiveLoginSuccess ?? false;

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

  // OFFLINE WALLET MINI-APP CHECKS

  // Start watching for ITW sagas that do not require internet connection or a valid session
  yield* fork(watchItwOfflineSaga);

  // Before continuing with the startup flow, we check if the app started offline.
  // In that case (offline wallet or timeout), we skip the saga to prevent triggering
  // network-dependent logic unnecessarily.
  const shouldExitFromStartupForOfflineAccess = yield* call(
    shouldExitForOfflineAccess
  );

  if (shouldExitFromStartupForOfflineAccess) {
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

  // TODO: review this logic in order to make it more simple and clear
  if (isActiveLoginSuccessProp) {
    NavigationService.navigate(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  }

  // BE CAREFUL where you get lollipop keyInfo.
  // They MUST be placed after authenticationSaga, because they are regenerated with each login attempt.
  // Get keyInfo for lollipop

  const keyInfo = yield* call(getKeyInfo);

  // Watches for session expiration or corruption and resets the application state accordingly
  yield* fork(watchForceLogoutSaga);
  yield* fork(watchForceLogoutOnDifferentCF);
  yield* fork(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel);

  // Instantiate a backend client from the session token
  const backendClient: ReturnType<typeof BackendClient> =
    backendClientManager.getBackendClient(apiUrlPrefix, sessionToken, keyInfo);

  // The following functions all rely on backendClient

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
  yield* fork(watchMessagesSaga, backendClient, sessionToken, keyInfo);

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
    > = yield* call(
      startAndReturnIdentificationResult,
      maybeStoredPin.value,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      IdentificationBackActionType.CLOSE_APP
    );

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
  // User is autenticated, session token is valid

  // active session login watcher
  yield* fork(watchActiveSessionLoginSaga);

  // Start wathing new wallet sagas
  yield* fork(watchWalletSaga);

  // Here we can be sure that the session information is loaded and valid
  const bpdToken = maybeSessionInformation.value.bpdToken as string;

  // Start watching for cgn actions
  yield* fork(watchBonusCgnSaga, sessionToken);

  const pnEnabled: ReturnType<typeof isPnRemoteEnabledSelector> = yield* select(
    isPnRemoteEnabledSelector
  );

  const aARRemoteEnabled = yield* select(isAARRemoteEnabled);

  if (pnEnabled) {
    // Start watching for PN actions
    yield* fork(watchPnSaga, sessionToken);

    if (aARRemoteEnabled) {
      yield* fork(watchAarFlowSaga, sessionToken, keyInfo);
    }
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

  // Check if we have any pending background action to be handled
  yield* call(maybeHandlePendingBackgroundActions, true);

  // This tells the security advice bottomsheet that it can be shown
  yield* put(setSecurityAdviceReadyToShow(true));

  yield* put(
    applicationInitialized({
      actionsToWaitFor: []
    })
  );
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
