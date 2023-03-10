import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { Alert } from "react-native";
import { channel } from "redux-saga";
import {
  call,
  cancel,
  delay,
  fork,
  put,
  select,
  spawn,
  take,
  takeEvery,
  takeLatest
} from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import PushNotification from "react-native-push-notification";
import { UserDataProcessingChoiceEnum } from "../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../definitions/backend/UserDataProcessingStatus";
import { BackendClient } from "../api/backend";
import {
  apiUrlPrefix,
  bonusVacanzeEnabled,
  bpdEnabled,
  cdcEnabled,
  euCovidCertificateEnabled,
  fciEnabled,
  mvlEnabled,
  pagoPaApiUrlPrefix,
  pagoPaApiUrlPrefixTest,
  pnEnabled,
  svEnabled,
  zendeskEnabled
} from "../config";
import { watchBonusSaga } from "../features/bonus/bonusVacanze/store/sagas/bonusSaga";
import { watchBonusBpdSaga } from "../features/bonus/bpd/saga";
import { watchBonusCgnSaga } from "../features/bonus/cgn/saga";
import { watchBonusSvSaga } from "../features/bonus/siciliaVola/saga";
import { watchEUCovidCertificateSaga } from "../features/euCovidCert/saga";
import { watchMvlSaga } from "../features/mvl/saga";
import { watchZendeskSupportSaga } from "../features/zendesk/saga";
import { watchFciSaga } from "../features/fci/saga";
import I18n from "../i18n";
import { mixpanelTrack } from "../mixpanel";
import NavigationService from "../navigation/NavigationService";
import { startApplicationInitialization } from "../store/actions/application";
import { sessionExpired } from "../store/actions/authentication";
import { previousInstallationDataDeleteSuccess } from "../store/actions/installation";
import { setMixpanelEnabled } from "../store/actions/mixpanel";
import {
  navigateToMainNavigatorAction,
  navigateToPaginatedMessageRouterAction,
  navigateToPrivacyScreen
} from "../store/actions/navigation";
import { clearNotificationPendingMessage } from "../store/actions/notifications";
import { clearOnboarding } from "../store/actions/onboarding";
import { clearCache, resetProfileState } from "../store/actions/profile";
import { loadUserDataProcessing } from "../store/actions/userDataProcessing";
import {
  sessionInfoSelector,
  sessionTokenSelector
} from "../store/reducers/authentication";
import { lollipopKeyTagSelector } from "../features/lollipop/store/reducers/lollipop";
import { generateLollipopKeySaga } from "../features/lollipop/saga";
import { IdentificationResult } from "../store/reducers/identification";
import { pendingMessageStateSelector } from "../store/reducers/notifications/pendingMessage";
import {
  isIdPayTestEnabledSelector,
  isPagoPATestEnabledSelector
} from "../store/reducers/persistedPreferences";
import {
  isProfileFirstOnBoarding,
  profileSelector
} from "../store/reducers/profile";
import { PinString } from "../types/PinString";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { isTestEnv } from "../utils/environment";
import { deletePin, getPin } from "../utils/keychain";
import { UIMessageId } from "../store/reducers/entities/messages/types";
import { watchBonusCdcSaga } from "../features/bonus/cdc/saga";
import { differentProfileLoggedIn } from "../store/actions/crossSessions";
import { clearAllAttachments } from "../features/messages/saga/clearAttachments";
import { watchMessageAttachmentsSaga } from "../features/messages/saga/attachments";
import { watchPnSaga } from "../features/pn/store/sagas/watchPnSaga";
import { startupLoadSuccess } from "../store/actions/startup";
import { watchIDPaySaga } from "../features/idpay/common/saga";
import {
  startAndReturnIdentificationResult,
  watchIdentification
} from "./identification";
import { previousInstallationDataDeleteSaga } from "./installation";
import watchLoadMessageDetails from "./messages/watchLoadMessageDetails";
import watchLoadNextPageMessages from "./messages/watchLoadNextPageMessages";
import watchLoadPreviousPageMessages from "./messages/watchLoadPreviousPageMessages";
import watchMigrateToPagination from "./messages/watchMigrateToPagination";
import watchReloadAllMessages from "./messages/watchReloadAllMessages";
import watchUpsertMessageStatusAttribues from "./messages/watchUpsertMessageStatusAttribues";
import {
  askMixpanelOptIn,
  handleSetMixpanelEnabled,
  initMixpanel
} from "./mixpanel";
import { updateInstallationSaga } from "./notifications";
import {
  loadProfile,
  watchProfile,
  watchProfileRefreshRequestsSaga,
  watchProfileUpsertRequestsSaga
} from "./profile";
import { askServicesPreferencesModeOptin } from "./services/servicesOptinSaga";
import { watchLoadServicesSaga } from "./services/watchLoadServicesSaga";
import { checkAppHistoryVersionSaga } from "./startup/appVersionHistorySaga";
import { authenticationSaga } from "./startup/authenticationSaga";
import { checkAcceptedTosSaga } from "./startup/checkAcceptedTosSaga";
import { checkAcknowledgedEmailSaga } from "./startup/checkAcknowledgedEmailSaga";
import { checkAcknowledgedFingerprintSaga } from "./startup/checkAcknowledgedFingerprintSaga";
import { checkConfiguredPinSaga } from "./startup/checkConfiguredPinSaga";
import { watchEmailNotificationPreferencesSaga } from "./startup/checkEmailNotificationPreferencesSaga";
import { checkProfileEnabledSaga } from "./startup/checkProfileEnabledSaga";
import { loadSessionInformationSaga } from "./startup/loadSessionInformationSaga";
import { watchAbortOnboardingSaga } from "./startup/watchAbortOnboardingSaga";
import { watchApplicationActivitySaga } from "./startup/watchApplicationActivitySaga";
import {
  checkSession,
  watchCheckSessionSaga
} from "./startup/watchCheckSessionSaga";
import { watchLogoutSaga } from "./startup/watchLogoutSaga";
import { watchSessionExpiredSaga } from "./startup/watchSessionExpiredSaga";
import { watchUserDataProcessingSaga } from "./user/userDataProcessing";
import {
  loadUserMetadata,
  watchLoadUserMetadata,
  watchUpserUserMetadata
} from "./user/userMetadata";
import { watchWalletSaga } from "./wallet";
import { watchProfileEmailValidationChangedSaga } from "./watchProfileEmailValidationChangedSaga";
import { completeOnboardingSaga } from "./startup/completeOnboardingSaga";
import { watchLoadMessageById } from "./messages/watchLoadMessageById";
import { watchThirdPartyMessageSaga } from "./messages/watchThirdPartyMessageSaga";
import { checkNotificationsPreferencesSaga } from "./startup/checkNotificationsPreferencesSaga";
import {
  getCryptoPublicKey,
  trackMixpanelCryptoKeyPairEvents
} from "./startup/generateCryptoKeyPair";

const WAIT_INITIALIZE_SAGA = 5000 as Millisecond;
const navigatorPollingTime = 125 as Millisecond;
const warningWaitNavigatorTime = 2000 as Millisecond;

/**
 * Handles the application startup and the main application logic loop
 */
// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
export function* initializeApplicationSaga(): Generator<
  ReduxSagaEffect,
  void,
  any
> {
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
  yield* call(previousInstallationDataDeleteSaga);
  yield* put(previousInstallationDataDeleteSuccess());

  // listen for mixpanel enabling events
  yield* takeLatest(setMixpanelEnabled, handleSetMixpanelEnabled);

  if (zendeskEnabled) {
    yield* fork(watchZendeskSupportSaga);
  }

  if (mvlEnabled) {
    // clear cached downloads when the logged user changes
    yield* takeEvery(differentProfileLoggedIn, clearAllAttachments);
  }

  // Get last logged in Profile from the state
  const lastLoggedInProfileState: ReturnType<typeof profileSelector> =
    yield* select(profileSelector);

  const lastEmailValidated = pot.isSome(lastLoggedInProfileState)
    ? O.fromNullable(lastLoggedInProfileState.value.is_email_validated)
    : O.none;

  // Watch for profile changes
  yield* fork(watchProfileEmailValidationChangedSaga, lastEmailValidated);

  // Reset the profile cached in redux: at each startup we want to load a fresh
  // user profile.
  yield* put(resetProfileState());

  // Generate key for lollipop
  // TODO Once the lollipop feature is spread to the all the user base,
  // consider refactoring even more by removing this, when
  // https://pagopa.atlassian.net/browse/LLK-38 has been fixed.
  // For now we need to generate a key in the application startup flow
  // to use this information on old app version already logged in users.
  // Here we are blocking the application startup, but we have the
  // the profile loading spinner active.
  yield* call(generateLollipopKeySaga);

  // Whether the user is currently logged in.
  const previousSessionToken: ReturnType<typeof sessionTokenSelector> =
    yield* select(sessionTokenSelector);

  // Unless we have a valid session token already, login until we have one.
  const sessionToken: SagaCallReturnType<typeof authenticationSaga> =
    previousSessionToken
      ? previousSessionToken
      : yield* call(authenticationSaga);

  // Handles the expiration of the session token
  yield* fork(watchSessionExpiredSaga);

  // Get keyInfo for lollipop
  const keyTag = yield* select(lollipopKeyTagSelector);
  const keyInfo = yield* call(getCryptoPublicKey, keyTag);

  // Instantiate a backend client from the session token
  const backendClient: ReturnType<typeof BackendClient> = BackendClient(
    apiUrlPrefix,
    sessionToken,
    keyInfo
  );

  // check if the current session is still valid
  const checkSessionResponse: SagaCallReturnType<typeof checkSession> =
    yield* call(checkSession, backendClient.getSession);
  if (checkSessionResponse === 401) {
    // This is the first API call we make to the backend, it may happen that
    // when we're using the previous session token, that session has expired
    // so we need to reset the session token and restart from scratch.
    yield* put(sessionExpired());
    return;
  }

  // whether we asked the user to login again
  const isSessionRefreshed = previousSessionToken !== sessionToken;

  // Let's see if have to load the session info, either because
  // we don't have one for the current session or because we
  // just refreshed the session.
  // FIXME: since it looks like we load the session info every
  //        time we get a session token, think about merging the
  //        two steps.
  // eslint-disable-next-line functional/no-let
  let maybeSessionInformation: ReturnType<typeof sessionInfoSelector> =
    yield* select(sessionInfoSelector);
  if (isSessionRefreshed || O.isNone(maybeSessionInformation)) {
    // let's try to load the session information from the backend.
    maybeSessionInformation = yield* call(
      loadSessionInformationSaga,
      backendClient.getSession
    );
    if (O.isNone(maybeSessionInformation)) {
      // we can't go further without session info, let's restart
      // the initialization process
      yield* put(startApplicationInitialization());
      return;
    }
  }

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
    // Start again if we can't load the profile but wait a while
    yield* delay(WAIT_INITIALIZE_SAGA);
    yield* put(startApplicationInitialization());
    return;
  }

  const userProfile = maybeUserProfile.value;

  // If user logged in with different credentials, but this device still has
  // user data loaded, then delete data keeping current session (user already
  // logged in)
  if (
    pot.isSome(lastLoggedInProfileState) &&
    lastLoggedInProfileState.value.fiscal_code !== userProfile.fiscal_code
  ) {
    // Delete all data while keeping current session:
    // Delete the current unlock code from the Keychain
    yield* call(deletePin);
    // Delete all onboarding data
    yield* put(clearOnboarding());
    yield* put(clearCache());
  }

  // Retrieve the configured unlock code from the keychain
  const maybeStoredPin: SagaCallReturnType<typeof getPin> = yield* call(getPin);

  // eslint-disable-next-line functional/no-let
  let storedPin: PinString;

  // Start watching for requests of refresh the profile
  yield* fork(watchProfileRefreshRequestsSaga, backendClient.getProfile);

  // Start watching for requests about session and support token
  yield* fork(
    watchCheckSessionSaga,
    backendClient.getSession,
    backendClient.getSupportToken
  );

  // Start watching for requests of abort the onboarding
  const watchAbortOnboardingSagaTask = yield* fork(watchAbortOnboardingSaga);

  const hasPreviousSessionAndPin =
    previousSessionToken && O.isSome(maybeStoredPin);
  if (hasPreviousSessionAndPin) {
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
  }

  // Ask to accept ToS if there is a new available version
  yield* call(checkAcceptedTosSaga, userProfile);

  // check if the user expressed preference about mixpanel, if not ask for it
  yield* call(askMixpanelOptIn);

  // Track crypto key generation info
  if (O.isSome(keyTag)) {
    yield* call(trackMixpanelCryptoKeyPairEvents, keyTag.value);
  }

  if (hasPreviousSessionAndPin) {
    // We have to retrieve the pin here and not on the previous if-condition (same guard)
    // otherwise the typescript compiler will complain of an unassigned variable later on
    storedPin = maybeStoredPin.value;
  } else {
    // TODO If the session was not valid, the code would have stopped before
    // reaching this point. Consider refactoring even more by removing the check
    // on the session (IOAPPCIT-10 https://pagopa.atlassian.net/browse/IOAPPCIT-10)
    storedPin = yield* call(checkConfiguredPinSaga);

    yield* call(checkAcknowledgedFingerprintSaga);

    yield* call(checkAcknowledgedEmailSaga, userProfile);
  }

  // check if the user must set preferences for push notifications (e.g. reminders)
  yield* call(checkNotificationsPreferencesSaga, userProfile);

  const isFirstOnboarding = isProfileFirstOnBoarding(userProfile);
  yield* call(askServicesPreferencesModeOptin, isFirstOnboarding);

  if (isFirstOnboarding) {
    // Show the thank-you screen for the onboarding
    yield* call(completeOnboardingSaga);
  }

  // Stop the watchAbortOnboardingSaga
  yield* cancel(watchAbortOnboardingSagaTask);

  // Start the notification installation update as early as
  // possible to begin receiving push notifications
  yield* call(updateInstallationSaga, backendClient.createOrUpdateInstallation);

  //
  // User is autenticated, session token is valid
  //

  if (bonusVacanzeEnabled) {
    // Start watching for requests about bonus
    yield* fork(watchBonusSaga, sessionToken);
  }

  if (bpdEnabled) {
    // Start watching for bpd actions
    yield* fork(watchBonusBpdSaga, maybeSessionInformation.value.bpdToken);
  }

  if (cdcEnabled) {
    // Start watching for cdc actions
    yield* fork(watchBonusCdcSaga, maybeSessionInformation.value.bpdToken);
  }

  // Start watching for cgn actions
  yield* fork(watchBonusCgnSaga, sessionToken);

  if (svEnabled) {
    // Start watching for sv actions
    yield* fork(watchBonusSvSaga, sessionToken);
  }

  if (euCovidCertificateEnabled) {
    // Start watching for EU Covid Certificate actions
    yield* fork(watchEUCovidCertificateSaga, sessionToken);
  }

  if (mvlEnabled) {
    // Start watching for MVL actions
    yield* fork(watchMvlSaga, sessionToken);
  }

  if (pnEnabled) {
    // Start watching for PN actions
    yield* fork(watchPnSaga, sessionToken);
  }

  // Start watching for message attachments actions (general
  // third-party message attachments, PN attachments and MVL ones)
  yield* fork(watchMessageAttachmentsSaga, sessionToken);

  const idPayTestEnabled: ReturnType<typeof isIdPayTestEnabledSelector> =
    yield* select(isIdPayTestEnabledSelector);

  if (idPayTestEnabled) {
    // Start watching for IDPay actions
    yield* fork(watchIDPaySaga, maybeSessionInformation.value.bpdToken);
  }

  if (fciEnabled) {
    yield* fork(watchFciSaga, sessionToken);
  }

  // Load the user metadata
  yield* call(loadUserMetadata, backendClient.getUserMetadata, true);

  // the wallet token is available,
  // proceed with starting the "watch wallet" saga
  const walletToken = maybeSessionInformation.value.walletToken;

  const isPagoPATestEnabled: ReturnType<typeof isPagoPATestEnabledSelector> =
    yield* select(isPagoPATestEnabledSelector);

  yield* fork(
    watchWalletSaga,
    sessionToken,
    walletToken,
    isPagoPATestEnabled ? pagoPaApiUrlPrefixTest : pagoPaApiUrlPrefix
  );

  // Check that profile is up to date (e.g. inbox enabled)
  yield* call(checkProfileEnabledSaga, userProfile);

  // Now we fork the tasks that will handle the async requests coming from the
  // UI of the application.
  // Note that the following sagas will be automatically cancelled each time
  // this parent saga gets restarted.

  yield* fork(watchLoadUserMetadata, backendClient.getUserMetadata);
  yield* fork(watchUpserUserMetadata, backendClient.createOrUpdateUserMetadata);

  yield* fork(
    watchUserDataProcessingSaga,
    backendClient.getUserDataProcessingRequest,
    backendClient.postUserDataProcessingRequest,
    backendClient.deleteUserDataProcessingRequest
  );

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
  // Load visible services and service details from backend when requested
  yield* fork(watchLoadServicesSaga, backendClient);

  yield* fork(watchLoadNextPageMessages, backendClient.getMessages);
  yield* fork(watchLoadPreviousPageMessages, backendClient.getMessages);
  yield* fork(watchReloadAllMessages, backendClient.getMessages);
  yield* fork(watchLoadMessageById, backendClient.getMessage);
  yield* fork(watchLoadMessageDetails, backendClient.getMessage);
  yield* fork(
    watchUpsertMessageStatusAttribues,
    backendClient.upsertMessageStatusAttributes
  );
  yield* fork(
    watchMigrateToPagination,
    backendClient.upsertMessageStatusAttributes
  );

  // Load third party message content when requested
  yield* fork(watchThirdPartyMessageSaga, backendClient);

  // Watch for the app going to background/foreground
  yield* fork(watchApplicationActivitySaga);

  // Watch for requests to logout
  // Since this saga is spawned and not forked
  // it will handle its own cancelation logic.
  yield* spawn(watchLogoutSaga, backendClient.logout);

  yield* fork(watchIdentification, storedPin);

  // Watch for checking the user email notifications preferences
  yield* fork(watchEmailNotificationPreferencesSaga);

  // Check if we have a pending notification message
  const pendingMessageState: ReturnType<typeof pendingMessageStateSelector> =
    yield* select(pendingMessageStateSelector);

  if (pendingMessageState) {
    // We have a pending notification message to handle
    const messageId = pendingMessageState.id;

    // Remove the pending message from the notification state
    yield* put(clearNotificationPendingMessage());

    yield* call(navigateToMainNavigatorAction);
    // Navigate to message router screen
    NavigationService.dispatchNavigationAction(
      navigateToPaginatedMessageRouterAction({
        messageId: messageId as UIMessageId,
        fromNotification: true
      })
    );
  } else {
    yield* put(startupLoadSuccess(true));
  }
}

/**
 * Wait until the {@link NavigationService} is initialized.
 * The NavigationService is initialized when is called {@link RootContainer} componentDidMount and the ref is set with setTopLevelNavigator
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

/**
 * Remove all the local notifications related to authentication with spid.
 *
 * With the previous library version (7.3.1 - now 8.1.1), cancelLocalNotifications
 * did not work. At the moment, the "first access spid" is the only kind of
 * scheduled notification and for this reason it is safe to use
 * PushNotification.cancelAllLocalNotifications();
 * If we add more scheduled notifications, we need to investigate if
 * cancelLocalNotifications works with the new library version
 */
function cancellAllLocalNotifications() {
  PushNotification.cancelAllLocalNotifications();
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

export const testCancellAllLocalNotifications = isTestEnv
  ? cancellAllLocalNotifications
  : undefined;
