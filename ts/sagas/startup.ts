import { fromNullable, isNone, none, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Alert } from "react-native";
import { channel } from "redux-saga";
import { call, cancel, delay, Effect, fork, put, select, spawn, take, takeEvery, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { UserDataProcessingChoiceEnum } from "../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../definitions/backend/UserDataProcessingStatus";
import { SpidIdp } from "../../definitions/content/SpidIdp";
import { BackendClient } from "../api/backend";
import { instabugLog, setInstabugProfileAttributes, TypeLogs } from "../boot/configureInstabug";
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
import { idpSelector, sessionInfoSelector, sessionTokenSelector } from "../store/reducers/authentication";
import { IdentificationResult } from "../store/reducers/identification";
import { pendingMessageStateSelector } from "../store/reducers/notifications/pendingMessage";
import { isPagoPATestEnabledSelector } from "../store/reducers/persistedPreferences";
import { isProfileFirstOnBoarding, profileSelector } from "../store/reducers/profile";
import { PinString } from "../types/PinString";
import { SagaCallReturnType } from "../types/utils";
import { deletePin, getPin } from "../utils/keychain";
import { localeDateFormat } from "../utils/locale";
import { isStringNullyOrEmpty } from "../utils/strings";
import { startAndReturnIdentificationResult, watchIdentification } from "./identification";
import { previousInstallationDataDeleteSaga } from "./installation";
import watchLoadMessageDetails from "./messages/watchLoadMessageDetails";
import watchLoadNextPageMessages from "./messages/watchLoadNextPageMessages";
import watchLoadPreviousPageMessages from "./messages/watchLoadPreviousPageMessages";
import watchReloadAllMessages from "./messages/watchReloadAllMessages";
import { askMixpanelOptIn, handleSetMixpanelEnabled, initMixpanel } from "./mixpanel";
import { updateInstallationSaga } from "./notifications";
import { loadProfile, watchProfile, watchProfileRefreshRequestsSaga, watchProfileUpsertRequestsSaga } from "./profile";
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
import { checkSession, watchCheckSessionSaga } from "./startup/watchCheckSessionSaga";
import { watchLoadMessages } from "./startup/watchLoadMessagesSaga";
import { watchLoadMessageWithRelationsSaga } from "./startup/watchLoadMessageWithRelationsSaga";
import { watchLogoutSaga } from "./startup/watchLogoutSaga";
import { watchMessageLoadSaga } from "./startup/watchMessageLoadSaga";
import { watchSessionExpiredSaga } from "./startup/watchSessionExpiredSaga";
import { watchUserDataProcessingSaga } from "./user/userDataProcessing";
import { loadUserMetadata, watchLoadUserMetadata, watchUpserUserMetadata } from "./user/userMetadata";
import { watchWalletSaga } from "./wallet";
import { watchProfileEmailValidationChangedSaga } from "./watchProfileEmailValidationChangedSaga";

// eslint-disable-next-line functional/no-let
let executionCount = 0;
/**
 * temporary log against https://pagopa.atlassian.net/browse/OPERISSUES-10
 * remove and clean after the issue will be addressed
 * @param event
 * @param properties
 * @constructor
 */
export const OPERISSUES_10_track = (
  event: string,
  properties: Record<string, unknown> | undefined = undefined
) => {
  const tag = `OPERISSUES_10_[${executionCount}]_`;
  instabugLog(
    event +
      (properties !== undefined ? ` [${JSON.stringify(properties)}]` : ""),
    TypeLogs.DEBUG,
    `${localeDateFormat(new Date(), "%d/%m/%Y-%H:%M:%S")}-${tag}`
  );
};

const WAIT_INITIALIZE_SAGA = 5000 as Millisecond;
const navigatorPollingTime = 125 as Millisecond;
const warningWaitNavigatorTime = 2000 as Millisecond;

/**
 * Handles the application startup and the main application logic loop
 */
// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
export function* initializeApplicationSaga(): Generator<Effect, void, any> {
  executionCount++;
  // Remove explicitly previous session data. This is done as completion of two
  // use cases:
  // 1. Logout with data reset
  // 2. FIXME: as a workaround for iOS only. Below iOS version 12.3 Keychain is
  //           not cleared between one installation and another, so it is
  //           needed to manually clear previous installation user info in
  //           order to force the user to choose unlock code and run through onboarding
  //           every new installation.

  // check if mixpanel could be initialized
  yield call(initMixpanel);
  yield call(waitForNavigatorServiceInitialization);

  yield call(previousInstallationDataDeleteSaga);
  yield put(previousInstallationDataDeleteSuccess());
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_1");

  yield call(OPERISSUES_10_track, "initializeApplicationSaga_2");
  // listen for mixpanel enabling events
  yield takeLatest(setMixpanelEnabled, handleSetMixpanelEnabled);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_3");
  if (zendeskEnabled) {
    yield fork(watchZendeskSupportSaga);
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_4");
  }
  // Get last logged in Profile from the state
  const lastLoggedInProfileState: ReturnType<typeof profileSelector> =
    yield select(profileSelector);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_5");
  const lastEmailValidated = pot.isSome(lastLoggedInProfileState)
    ? fromNullable(lastLoggedInProfileState.value.is_email_validated)
    : none;
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_6");
  // Watch for profile changes
  yield fork(watchProfileEmailValidationChangedSaga, lastEmailValidated);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_7");
  // Reset the profile cached in redux: at each startup we want to load a fresh
  // user profile.
  yield put(resetProfileState());
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_8");
  // Whether the user is currently logged in.
  const previousSessionToken: ReturnType<typeof sessionTokenSelector> =
    yield select(sessionTokenSelector);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_9", {
    isTokenNullyOrEmpty: isStringNullyOrEmpty(previousSessionToken)
  });
  // Unless we have a valid session token already, login until we have one.
  const sessionToken: SagaCallReturnType<typeof authenticationSaga> =
    previousSessionToken
      ? previousSessionToken
      : yield call(authenticationSaga);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_10");
  // Handles the expiration of the session token
  yield fork(watchSessionExpiredSaga);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_11");
  // Instantiate a backend client from the session token
  const backendClient: ReturnType<typeof BackendClient> = BackendClient(
    apiUrlPrefix,
    sessionToken
  );

  // check if the current session is still valid
  const checkSessionResponse: SagaCallReturnType<typeof checkSession> =
    yield call(checkSession, backendClient.getSession);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_12");
  if (checkSessionResponse === 401) {
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_13");
    // This is the first API call we make to the backend, it may happen that
    // when we're using the previous session token, that session has expired
    // so we need to reset the session token and restart from scratch.
    yield put(sessionExpired());
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_14");
    return;
  }

  // Start the notification installation update as early as
  // possible to begin receiving push notifications
  yield call(updateInstallationSaga, backendClient.createOrUpdateInstallation);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_15");
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
    yield select(sessionInfoSelector);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_16");
  if (isSessionRefreshed || maybeSessionInformation.isNone()) {
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_17");
    // let's try to load the session information from the backend.
    maybeSessionInformation = yield call(
      loadSessionInformationSaga,
      backendClient.getSession
    );
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_18");
    if (maybeSessionInformation.isNone()) {
      // we can't go further without session info, let's restart
      // the initialization process
      yield put(startApplicationInitialization());
      yield call(OPERISSUES_10_track, "initializeApplicationSaga_19");
      return;
    }
  }

  // Start watching for profile update requests as the checkProfileEnabledSaga
  // may need to update the profile.
  yield fork(
    watchProfileUpsertRequestsSaga,
    backendClient.createOrUpdateProfile
  );
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_20");
  // Start watching when profile is successfully loaded
  yield fork(watchProfile, backendClient.startEmailValidationProcess);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_21");
  // If we are here the user is logged in and the session info is
  // loaded and valid

  // Load the profile info
  const maybeUserProfile: SagaCallReturnType<typeof loadProfile> = yield call(
    loadProfile,
    backendClient.getProfile
  );
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_22");
  if (isNone(maybeUserProfile)) {
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_23");
    // Start again if we can't load the profile but wait a while
    yield delay(WAIT_INITIALIZE_SAGA);
    yield put(startApplicationInitialization());
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_24");
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
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_25");
    // Delete all data while keeping current session:
    // Delete the current unlock code from the Keychain
    yield call(deletePin);
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_26");
    // Delete all onboarding data
    yield put(clearOnboarding());
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_27");
    yield put(clearCache());
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_28");
  }

  const maybeIdp: Option<SpidIdp> = yield select(idpSelector);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_29");
  setInstabugProfileAttributes(maybeIdp);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_30");
  // Retrieve the configured unlock code from the keychain
  const maybeStoredPin: SagaCallReturnType<typeof getPin> = yield call(getPin);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_31");
  // eslint-disable-next-line functional/no-let
  let storedPin: PinString;

  // Start watching for requests of refresh the profile
  yield fork(watchProfileRefreshRequestsSaga, backendClient.getProfile);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_32");
  // Start watching for requests about session and support token
  yield fork(
    watchCheckSessionSaga,
    backendClient.getSession,
    backendClient.getSupportToken
  );
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_33");
  // Start watching for requests of abort the onboarding
  const watchAbortOnboardingSagaTask = yield fork(watchAbortOnboardingSaga);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_34");
  if (!previousSessionToken || isNone(maybeStoredPin)) {
    // The user wasn't logged in when the application started or, for some
    // reason, he was logged in but there is no unlock code set, thus we need
    // to pass through the onboarding process.
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_35");
    // Ask to accept ToS if it is the first access on IO or if there is a new available version of ToS
    yield call(checkAcceptedTosSaga, userProfile);
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_36");
    // check if the user expressed preference about mixpanel, if not ask for it
    yield call(askMixpanelOptIn);
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_37");
    storedPin = yield call(checkConfiguredPinSaga);
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_38");
    yield call(checkAcknowledgedFingerprintSaga);
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_39");
    yield call(checkAcknowledgedEmailSaga, userProfile);
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_40");
    yield call(
      askServicesPreferencesModeOptin,
      isProfileFirstOnBoarding(userProfile)
    );
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_41");
    // Stop the watchAbortOnboardingSaga
    yield cancel(watchAbortOnboardingSagaTask);
  } else {
    storedPin = maybeStoredPin.value;
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_42");
    if (!isSessionRefreshed) {
      // The user was previously logged in, so no onboarding is needed
      // The session was valid so the user didn't event had to do a full login,
      // in this case we ask the user to identify using the unlock code.
      const identificationResult: SagaCallReturnType<
        typeof startAndReturnIdentificationResult
      > = yield call(startAndReturnIdentificationResult, storedPin);
      yield call(OPERISSUES_10_track, "initializeApplicationSaga_43");
      if (identificationResult === IdentificationResult.pinreset) {
        yield call(OPERISSUES_10_track, "initializeApplicationSaga_44");
        // If we are here the user had chosen to reset the unlock code
        yield put(startApplicationInitialization());
        return;
      }
      // Ask to accept ToS if there is a new available version
      yield call(checkAcceptedTosSaga, userProfile);
      yield call(OPERISSUES_10_track, "initializeApplicationSaga_45");
      // check if the user expressed preference about mixpanel, if not ask for it
      yield call(askMixpanelOptIn);
      yield call(OPERISSUES_10_track, "initializeApplicationSaga_46");
      yield call(askServicesPreferencesModeOptin, false);
      yield call(OPERISSUES_10_track, "initializeApplicationSaga_47");
      // Stop the watchAbortOnboardingSaga
      yield cancel(watchAbortOnboardingSagaTask);
    }
  }

  //
  // User is autenticated, session token is valid
  //

  if (bonusVacanzeEnabled) {
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_48");
    // Start watching for requests about bonus
    yield fork(watchBonusSaga, sessionToken);
  }

  if (bpdEnabled) {
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_49");
    // Start watching for bpd actions
    yield fork(watchBonusBpdSaga, maybeSessionInformation.value.bpdToken);
  }

  yield call(OPERISSUES_10_track, "initializeApplicationSaga_50");
  // Start watching for cgn actions
  yield fork(watchBonusCgnSaga, sessionToken);

  if (svEnabled) {
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_51");
    // Start watching for sv actions
    yield fork(watchBonusSvSaga, sessionToken);
  }

  if (euCovidCertificateEnabled) {
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_52");
    // Start watching for EU Covid Certificate actions
    yield fork(watchEUCovidCertificateSaga, sessionToken);
  }

  if (mvlEnabled) {
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_53");
    // Start watching for MVL actions
    yield fork(watchMvlSaga, sessionToken);
  }

  // Load the user metadata
  yield call(loadUserMetadata, backendClient.getUserMetadata, true);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_54");
  // the wallet token is available,
  // proceed with starting the "watch wallet" saga
  const walletToken = maybeSessionInformation.value.walletToken;
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_55");
  const isPagoPATestEnabled: ReturnType<typeof isPagoPATestEnabledSelector> =
    yield select(isPagoPATestEnabledSelector);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_56");
  yield fork(
    watchWalletSaga,
    sessionToken,
    walletToken,
    isPagoPATestEnabled ? pagoPaApiUrlPrefixTest : pagoPaApiUrlPrefix
  );
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_57");
  // Check that profile is up to date (e.g. inbox enabled)
  yield call(checkProfileEnabledSaga, userProfile);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_58");
  // Now we fork the tasks that will handle the async requests coming from the
  // UI of the application.
  // Note that the following sagas will be automatically cancelled each time
  // this parent saga gets restarted.
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_59");
  yield fork(watchLoadUserMetadata, backendClient.getUserMetadata);
  yield fork(watchUpserUserMetadata, backendClient.createOrUpdateUserMetadata);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_60");
  yield fork(
    watchUserDataProcessingSaga,
    backendClient.getUserDataProcessingRequest,
    backendClient.postUserDataProcessingRequest,
    backendClient.deleteUserDataProcessingRequest
  );
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_61");
  if (isSessionRefreshed) {
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_62");
    // Only if the user are logging in check the account removal status and,
    // if is PENDING show an alert to notify him.
    const checkUserDeletePendingTask: any = yield takeLatest(
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
          const action: leftOrRight = yield take(alertChoiceChannel);
          if (action === "left") {
            yield call(navigateToPrivacyScreen);
          }
          yield cancel(checkUserDeletePendingTask);
        }
      }
    );
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_63");
    yield put(
      loadUserDataProcessing.request(UserDataProcessingChoiceEnum.DELETE)
    );
  }
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_64");
  // Load visible services and service details from backend when requested
  yield fork(watchLoadServicesSaga, backendClient);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_65");
  // Load all messages when requested
  yield fork(watchLoadMessages, backendClient.getMessages);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_66");
  if (usePaginatedMessages) {
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_67");
    yield fork(watchLoadNextPageMessages, backendClient.getMessages);
    yield fork(watchLoadPreviousPageMessages, backendClient.getMessages);
    yield fork(watchReloadAllMessages, backendClient.getMessages);
    yield fork(watchLoadMessageDetails, backendClient.getMessage);
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_68");
  }
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_69");
  // Load a message when requested
  yield fork(watchMessageLoadSaga, backendClient.getMessage);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_70");
  // Load message and related entities (ex. the sender service)
  yield takeEvery(
    getType(loadMessageWithRelations.request),
    watchLoadMessageWithRelationsSaga,
    backendClient.getMessage
  );
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_71");
  // Watch for the app going to background/foreground
  yield fork(watchApplicationActivitySaga);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_72");
  // Watch for requests to logout
  yield spawn(watchLogoutSaga, backendClient.logout);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_73");
  yield fork(watchIdentification, storedPin);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_74");
  // Watch for checking the user email notifications preferences
  yield fork(watchEmailNotificationPreferencesSaga);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_75");
  // Check if we have a pending notification message
  const pendingMessageState: ReturnType<typeof pendingMessageStateSelector> =
    yield select(pendingMessageStateSelector);
  yield call(OPERISSUES_10_track, "initializeApplicationSaga_76");
  if (pendingMessageState) {
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_77");
    // We have a pending notification message to handle
    const messageId = pendingMessageState.id;

    // Remove the pending message from the notification state
    yield put(clearNotificationPendingMessage());
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_78");
    // Navigate to message router screen
    yield call(navigateToMessageRouterScreen, { messageId });
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_79");
  } else {
    yield call(navigateToMainNavigatorAction);
    yield call(OPERISSUES_10_track, "initializeApplicationSaga_80");
  }
}

/**
 * Wait until the {@link NavigationService} is initialized.
 * The NavigationService is initialized when is called {@link RootContainer} componentDidMount and the ref is set with setTopLevelNavigator
 */
function* waitForNavigatorServiceInitialization() {
  // eslint-disable-next-line functional/no-let
  let navigator: ReturnType<typeof NavigationService.getNavigator> = yield call(
    NavigationService.getNavigator
  );

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
      yield call(mixpanelTrack, "NAVIGATION_SERVICE_INITIALIZATION_TIMEOUT");
    }
    yield delay(navigatorPollingTime);
    navigator = yield call(NavigationService.getNavigator);
  }

  const initTime = performance.now() - startTime;

  instabugLog(
    `NavigationService initialized after ${initTime} ms`,
    TypeLogs.DEBUG,
    "initializeApplicationSaga"
  );
  yield call(mixpanelTrack, "NAVIGATION_SERVICE_INITIALIZATION_COMPLETED", {
    elapsedTime: initTime
  });
}

export function* startupSaga(): IterableIterator<Effect> {
  // Wait until the IngressScreen gets mounted
  yield takeLatest(
    getType(startApplicationInitialization),
    initializeApplicationSaga
  );
}
