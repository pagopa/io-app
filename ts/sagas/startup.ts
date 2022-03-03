import { fromNullable, isNone, none, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Millisecond } from "italia-ts-commons/lib/units";
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
import { UserDataProcessingChoiceEnum } from "../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../definitions/backend/UserDataProcessingStatus";
import { SpidIdp } from "../../definitions/content/SpidIdp";
import { BackendClient } from "../api/backend";
import {
  instabugLog,
  setInstabugProfileAttributes,
  TypeLogs
} from "../boot/configureInstabug";
import {
  apiUrlPrefix,
  bonusVacanzeEnabled,
  bpdEnabled,
  euCovidCertificateEnabled,
  mvlEnabled,
  pagoPaApiUrlPrefix,
  pagoPaApiUrlPrefixTest,
  svEnabled,
  usePaginatedMessages,
  zendeskEnabled
} from "../config";
import { watchBonusSaga } from "../features/bonus/bonusVacanze/store/sagas/bonusSaga";
import { watchBonusBpdSaga } from "../features/bonus/bpd/saga";
import { watchBonusCgnSaga } from "../features/bonus/cgn/saga";
import { watchBonusSvSaga } from "../features/bonus/siciliaVola/saga";
import { watchEUCovidCertificateSaga } from "../features/euCovidCert/saga";
import { watchMvlSaga } from "../features/mvl/saga";
import { watchZendeskSupportSaga } from "../features/zendesk/saga";
import I18n from "../i18n";
import { mixpanelTrack } from "../mixpanel";
import NavigationService from "../navigation/NavigationService";
import { startApplicationInitialization } from "../store/actions/application";
import { sessionExpired } from "../store/actions/authentication";
import { previousInstallationDataDeleteSuccess } from "../store/actions/installation";
import { loadMessageWithRelations } from "../store/actions/messages";
import { setMixpanelEnabled } from "../store/actions/mixpanel";
import {
  navigateToMainNavigatorAction,
  navigateToMessageRouterScreen,
  navigateToPrivacyScreen
} from "../store/actions/navigation";
import { clearNotificationPendingMessage } from "../store/actions/notifications";
import { clearOnboarding } from "../store/actions/onboarding";
import { clearCache, resetProfileState } from "../store/actions/profile";
import { loadUserDataProcessing } from "../store/actions/userDataProcessing";
import {
  idpSelector,
  sessionInfoSelector,
  sessionTokenSelector
} from "../store/reducers/authentication";
import { IdentificationResult } from "../store/reducers/identification";
import { pendingMessageStateSelector } from "../store/reducers/notifications/pendingMessage";
import { isPagoPATestEnabledSelector } from "../store/reducers/persistedPreferences";
import {
  isProfileFirstOnBoarding,
  profileSelector
} from "../store/reducers/profile";
import { PinString } from "../types/PinString";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { isTestEnv } from "../utils/environment";
import { deletePin, getPin } from "../utils/keychain";
import {
  startAndReturnIdentificationResult,
  watchIdentification
} from "./identification";
import { previousInstallationDataDeleteSaga } from "./installation";
import watchLoadMessageDetails from "./messages/watchLoadMessageDetails";
import watchLoadNextPageMessages from "./messages/watchLoadNextPageMessages";
import watchLoadPreviousPageMessages from "./messages/watchLoadPreviousPageMessages";
import watchReloadAllMessages from "./messages/watchReloadAllMessages";
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
import { watchLoadMessages } from "./startup/watchLoadMessagesSaga";
import { watchLoadMessageWithRelationsSaga } from "./startup/watchLoadMessageWithRelationsSaga";
import { watchLogoutSaga } from "./startup/watchLogoutSaga";
import { watchMessageLoadSaga } from "./startup/watchMessageLoadSaga";
import { watchSessionExpiredSaga } from "./startup/watchSessionExpiredSaga";
import { watchUserDataProcessingSaga } from "./user/userDataProcessing";
import {
  loadUserMetadata,
  watchLoadUserMetadata,
  watchUpserUserMetadata
} from "./user/userMetadata";
import { watchWalletSaga } from "./wallet";
import { watchProfileEmailValidationChangedSaga } from "./watchProfileEmailValidationChangedSaga";
import { checkAppHistoryVersionSaga } from "./startup/appVersionHistorySaga";

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

  yield* call(previousInstallationDataDeleteSaga);
  yield* put(previousInstallationDataDeleteSuccess());

  // listen for mixpanel enabling events
  yield* takeLatest(setMixpanelEnabled, handleSetMixpanelEnabled);

  if (zendeskEnabled) {
    yield* fork(watchZendeskSupportSaga);
  }
  // Get last logged in Profile from the state
  const lastLoggedInProfileState: ReturnType<typeof profileSelector> =
    yield* select(profileSelector);

  const lastEmailValidated = pot.isSome(lastLoggedInProfileState)
    ? fromNullable(lastLoggedInProfileState.value.is_email_validated)
    : none;

  // Watch for profile changes
  yield* fork(watchProfileEmailValidationChangedSaga, lastEmailValidated);

  // Reset the profile cached in redux: at each startup we want to load a fresh
  // user profile.
  yield* put(resetProfileState());

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

  // Instantiate a backend client from the session token
  const backendClient: ReturnType<typeof BackendClient> = BackendClient(
    apiUrlPrefix,
    sessionToken
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

  // Start the notification installation update as early as
  // possible to begin receiving push notifications
  yield* call(updateInstallationSaga, backendClient.createOrUpdateInstallation);

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
  if (isSessionRefreshed || maybeSessionInformation.isNone()) {
    // let's try to load the session information from the backend.
    maybeSessionInformation = yield* call(
      loadSessionInformationSaga,
      backendClient.getSession
    );
    if (maybeSessionInformation.isNone()) {
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

  if (isNone(maybeUserProfile)) {
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

  const maybeIdp: Option<SpidIdp> = yield* select(idpSelector);

  setInstabugProfileAttributes(maybeIdp);

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

  if (!previousSessionToken || isNone(maybeStoredPin)) {
    // The user wasn't logged in when the application started or, for some
    // reason, he was logged in but there is no unlock code set, thus we need
    // to pass through the onboarding process.

    // Ask to accept ToS if it is the first access on IO or if there is a new available version of ToS
    yield* call(checkAcceptedTosSaga, userProfile);

    // check if the user expressed preference about mixpanel, if not ask for it
    yield* call(askMixpanelOptIn);

    storedPin = yield* call(checkConfiguredPinSaga);

    yield* call(checkAcknowledgedFingerprintSaga);

    yield* call(checkAcknowledgedEmailSaga, userProfile);

    yield* call(
      askServicesPreferencesModeOptin,
      isProfileFirstOnBoarding(userProfile)
    );

    // Stop the watchAbortOnboardingSaga
    yield* cancel(watchAbortOnboardingSagaTask);
  } else {
    storedPin = maybeStoredPin.value;
    if (!isSessionRefreshed) {
      // The user was previously logged in, so no onboarding is needed
      // The session was valid so the user didn't event had to do a full login,
      // in this case we ask the user to identify using the unlock code.
      // FIXME: This is an unsafe cast caused by a wrongly described type.
      const identificationResult: SagaCallReturnType<
        typeof startAndReturnIdentificationResult
      > = yield* call(startAndReturnIdentificationResult, storedPin);

      if (identificationResult === IdentificationResult.pinreset) {
        // If we are here the user had chosen to reset the unlock code
        yield* put(startApplicationInitialization());
        return;
      }
      // Ask to accept ToS if there is a new available version
      yield* call(checkAcceptedTosSaga, userProfile);

      // check if the user expressed preference about mixpanel, if not ask for it
      yield* call(askMixpanelOptIn);

      yield* call(askServicesPreferencesModeOptin, false);

      // Stop the watchAbortOnboardingSaga
      yield* cancel(watchAbortOnboardingSagaTask);
    }
  }

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
        const maybeDeletePending = fromNullable(
          loadUserDataProcessingSuccess.payload.value
        ).filter(
          uc =>
            uc.choice === UserDataProcessingChoiceEnum.DELETE &&
            uc.status === UserDataProcessingStatusEnum.PENDING
        );
        type leftOrRight = "left" | "right";
        const alertChoiceChannel = channel<leftOrRight>();
        if (maybeDeletePending.isSome()) {
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

  // Load all messages when requested
  yield* fork(watchLoadMessages, backendClient.getMessages);

  if (usePaginatedMessages) {
    yield* fork(watchLoadNextPageMessages, backendClient.getMessages);
    yield* fork(watchLoadPreviousPageMessages, backendClient.getMessages);
    yield* fork(watchReloadAllMessages, backendClient.getMessages);
    yield* fork(watchLoadMessageDetails, backendClient.getMessage);
  }

  // Load a message when requested
  yield* fork(watchMessageLoadSaga, backendClient.getMessage);

  // Load message and related entities (ex. the sender service)
  yield* takeEvery(
    getType(loadMessageWithRelations.request),
    watchLoadMessageWithRelationsSaga,
    backendClient.getMessage
  );

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
    // Navigate to message router screen
    yield* call(navigateToMessageRouterScreen, { messageId });
  } else {
    yield* call(navigateToMainNavigatorAction);
  }
}

/**
 * Wait until the {@link NavigationService} is initialized.
 * The NavigationService is initialized when is called {@link RootContainer} componentDidMount and the ref is set with setTopLevelNavigator
 */
function* waitForNavigatorServiceInitialization() {
  // eslint-disable-next-line functional/no-let
  let navigator: ReturnType<typeof NavigationService.getNavigator> =
    yield* call(NavigationService.getNavigator);

  // eslint-disable-next-line functional/no-let
  let timeoutLogged = false;

  const startTime = performance.now();

  // before continuing we must wait for the navigatorService to be ready
  while (navigator === null || navigator === undefined) {
    const elapsedTime = performance.now() - startTime;
    if (!timeoutLogged && elapsedTime >= warningWaitNavigatorTime) {
      timeoutLogged = true;
      instabugLog(
        `NavigationService is not initialized after ${elapsedTime} ms`,
        TypeLogs.ERROR,
        "initializeApplicationSaga"
      );
      yield* call(mixpanelTrack, "NAVIGATION_SERVICE_INITIALIZATION_TIMEOUT");
    }
    yield* delay(navigatorPollingTime);
    navigator = yield* call(NavigationService.getNavigator);
  }

  const initTime = performance.now() - startTime;

  instabugLog(
    `NavigationService initialized after ${initTime} ms`,
    TypeLogs.DEBUG,
    "initializeApplicationSaga"
  );
  yield* call(mixpanelTrack, "NAVIGATION_SERVICE_INITIALIZATION_COMPLETED", {
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
