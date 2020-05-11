import { fromNullable, isNone, none, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Millisecond } from "italia-ts-commons/lib/units";
import { NavigationActions, NavigationState } from "react-navigation";
import { Effect } from "redux-saga";
import {
  call,
  cancel,
  fork,
  put,
  select,
  spawn,
  takeEvery,
  takeLatest
} from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { BackendClient } from "../api/backend";
import { setInstabugProfileAttributes } from "../boot/configureInstabug";
import {
  apiUrlPrefix,
  pagoPaApiUrlPrefix,
  pagoPaApiUrlPrefixTest
} from "../config";
import { IdentityProvider } from "../models/IdentityProvider";
import AppNavigator from "../navigation/AppNavigator";
import { startApplicationInitialization } from "../store/actions/application";
import { sessionExpired } from "../store/actions/authentication";
import { previousInstallationDataDeleteSuccess } from "../store/actions/installation";
import { loadMessageWithRelations } from "../store/actions/messages";
import {
  navigateToMainNavigatorAction,
  navigateToMessageDetailScreenAction
} from "../store/actions/navigation";
import { navigationHistoryPush } from "../store/actions/navigationHistory";
import { clearNotificationPendingMessage } from "../store/actions/notifications";
import { clearOnboarding } from "../store/actions/onboarding";
import { clearCache, resetProfileState } from "../store/actions/profile";
import {
  idpSelector,
  sessionInfoSelector,
  sessionTokenSelector
} from "../store/reducers/authentication";
import { IdentificationResult } from "../store/reducers/identification";
import { navigationStateSelector } from "../store/reducers/navigation";
import { pendingMessageStateSelector } from "../store/reducers/notifications/pendingMessage";
import { isPagoPATestEnabledSelector } from "../store/reducers/persistedPreferences";
import { profileSelector } from "../store/reducers/profile";
import { GlobalState } from "../store/reducers/types";
import { PinString } from "../types/PinString";
import { SagaCallReturnType } from "../types/utils";
import { deletePin, getPin } from "../utils/keychain";
import { startTimer } from "../utils/timer";
import { watchProfileEmailValidationChangedSaga } from "./watchProfileEmailValidationChangedSaga";

import {
  startAndReturnIdentificationResult,
  watchIdentificationRequest
} from "./identification";
import { previousInstallationDataDeleteSaga } from "./installation";
import { updateInstallationSaga } from "./notifications";
import {
  loadProfile,
  watchProfileRefreshRequestsSaga,
  watchProfileSendEmailValidationSaga,
  watchProfileUpsertRequestsSaga
} from "./profile";
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
import { watchCheckSessionSaga } from "./startup/watchCheckSessionSaga";
import { watchMessagesLoadOrCancelSaga } from "./startup/watchLoadMessagesSaga";
import { loadMessageWithRelationsSaga } from "./startup/watchLoadMessageWithRelationsSaga";
import { watchLogoutSaga } from "./startup/watchLogoutSaga";
import { watchMessageLoadSaga } from "./startup/watchMessageLoadSaga";
import { watchPinResetSaga } from "./startup/watchPinResetSaga";
import { watchSessionExpiredSaga } from "./startup/watchSessionExpiredSaga";
import { watchUserDataProcessingSaga } from "./user/userDataProcessing";
import {
  loadUserMetadata,
  watchLoadUserMetadata,
  watchUpserUserMetadata
} from "./user/userMetadata";
import { watchWalletSaga } from "./wallet";

const WAIT_INITIALIZE_SAGA = 3000 as Millisecond;
/**
 * Handles the application startup and the main application logic loop
 */
// tslint:disable-next-line:cognitive-complexity no-big-function
export function* initializeApplicationSaga(): IterableIterator<Effect> {
  // Remove explicitly previous session data. This is done as completion of two
  // use cases:
  // 1. Logout with data reset
  // 2. FIXME: as a workaround for iOS only. Below iOS version 12.3 Keychain is
  //           not cleared between one installation and another, so it is
  //           needed to manually clear previous installation user info in
  //           order to force the user to choose unlock code and run through onboarding
  //           every new installation.

  yield call(previousInstallationDataDeleteSaga);
  yield put(previousInstallationDataDeleteSuccess());

  // Get last logged in Profile from the state
  const lastLoggedInProfileState: ReturnType<
    typeof profileSelector
  > = yield select<GlobalState>(profileSelector);

  const lastEmailValidated = pot.isSome(lastLoggedInProfileState)
    ? fromNullable(lastLoggedInProfileState.value.is_email_validated)
    : none;

  // Watch for profile changes
  yield fork(watchProfileEmailValidationChangedSaga, lastEmailValidated);

  // Reset the profile cached in redux: at each startup we want to load a fresh
  // user profile.
  yield put(resetProfileState());

  // Whether the user is currently logged in.
  const previousSessionToken: ReturnType<
    typeof sessionTokenSelector
  > = yield select<GlobalState>(sessionTokenSelector);

  // Unless we have a valid session token already, login until we have one.
  const sessionToken: SagaCallReturnType<
    typeof authenticationSaga
  > = previousSessionToken
    ? previousSessionToken
    : yield call(authenticationSaga);

  // Handles the expiration of the session token
  yield fork(watchSessionExpiredSaga);

  // Instantiate a backend client from the session token
  const backendClient: ReturnType<typeof BackendClient> = BackendClient(
    apiUrlPrefix,
    sessionToken
  );

  // Start the notification installation update as early as
  // possible to begin receiving push notifications
  const installationResponseStatus: SagaCallReturnType<
    typeof updateInstallationSaga
  > = yield call(
    updateInstallationSaga,
    backendClient.createOrUpdateInstallation
  );
  if (installationResponseStatus === 401) {
    // This is the first API call we make to the backend, it may happen that
    // when we're using the previous session token, that session has expired
    // so we need to reset the session token and restart from scratch.
    yield put(sessionExpired());
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
  // tslint:disable-next-line: no-let
  let maybeSessionInformation: ReturnType<
    typeof sessionInfoSelector
  > = yield select<GlobalState>(sessionInfoSelector);
  if (isSessionRefreshed || maybeSessionInformation.isNone()) {
    // let's try to load the session information from the backend.
    maybeSessionInformation = yield call(
      loadSessionInformationSaga,
      backendClient.getSession
    );
    if (maybeSessionInformation.isNone()) {
      // we can't go further without session info, let's restart
      // the initialization process
      yield put(startApplicationInitialization());
      return;
    }
  }

  // If we are here the user is logged in and the session info is
  // loaded and valid

  // Load the profile info
  const maybeUserProfile: SagaCallReturnType<typeof loadProfile> = yield call(
    loadProfile,
    backendClient.getProfile
  );

  if (isNone(maybeUserProfile)) {
    // Start again if we can't load the profile but wait a while
    yield call(startTimer, WAIT_INITIALIZE_SAGA);
    yield put(startApplicationInitialization());
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
    // tslint:disable-next-line:saga-yield-return-type
    yield call(deletePin);
    // Delete all onboarding data
    yield put(clearOnboarding());
    yield put(clearCache());
  }

  const maybeIdp: Option<IdentityProvider> = yield select<GlobalState>(
    idpSelector
  );

  setInstabugProfileAttributes(maybeIdp);

  // Retrieve the configured unlock code from the keychain
  const maybeStoredPin: SagaCallReturnType<typeof getPin> = yield call(getPin);

  // tslint:disable-next-line:no-let
  let storedPin: PinString;

  // Start watching for profile update requests as the checkProfileEnabledSaga
  // may need to update the profile.
  yield fork(
    watchProfileUpsertRequestsSaga,
    backendClient.createOrUpdateProfile
  );

  // Start watching for requests of refresh the profile
  yield fork(watchProfileRefreshRequestsSaga, backendClient.getProfile);

  // Start watching for requests of checkSession
  yield fork(watchCheckSessionSaga, backendClient.getProfile);

  // Start watching for the requests of a new verification email to
  // validate the user email address
  yield fork(
    watchProfileSendEmailValidationSaga,
    backendClient.startEmailValidationProcess
  );

  // Start watching for requests of abort the onboarding
  const watchAbortOnboardingSagaTask = yield fork(watchAbortOnboardingSaga);

  if (!previousSessionToken || isNone(maybeStoredPin)) {
    // The user wasn't logged in when the application started or, for some
    // reason, he was logged in but there is no unlock code set, thus we need
    // to pass through the onboarding process.

    // Ask to accept ToS if it is the first access on IO or if there is a new available version of ToS
    yield call(checkAcceptedTosSaga, userProfile);

    storedPin = yield call(checkConfiguredPinSaga);

    yield call(checkAcknowledgedFingerprintSaga);

    yield call(checkAcknowledgedEmailSaga, userProfile);

    // Stop the watchAbortOnboardingSaga
    yield cancel(watchAbortOnboardingSagaTask);
  } else {
    storedPin = maybeStoredPin.value;
    if (!isSessionRefreshed) {
      // The user was previously logged in, so no onboarding is needed
      // The session was valid so the user didn't event had to do a full login,
      // in this case we ask the user to identify using the unlock code.
      const identificationResult: SagaCallReturnType<
        typeof startAndReturnIdentificationResult
      > = yield call(startAndReturnIdentificationResult, storedPin);
      if (identificationResult === IdentificationResult.pinreset) {
        // If we are here the user had chosen to reset the unlock code
        yield put(startApplicationInitialization());
        return;
      }
      // Ask to accept ToS if there is a new available version
      yield call(checkAcceptedTosSaga, userProfile);

      // Stop the watchAbortOnboardingSaga
      yield cancel(watchAbortOnboardingSagaTask);
    }
  }

  //
  // User is autenticated, session token is valid
  //

  // Load the user metadata
  yield call(loadUserMetadata, backendClient.getUserMetadata, true);

  // the wallet token is available,
  // proceed with starting the "watch wallet" saga
  const walletToken = maybeSessionInformation.value.walletToken;

  const isPagoPATestEnabled: ReturnType<
    typeof isPagoPATestEnabledSelector
  > = yield select<GlobalState>(isPagoPATestEnabledSelector);

  yield fork(
    watchWalletSaga,
    sessionToken,
    walletToken,
    isPagoPATestEnabled ? pagoPaApiUrlPrefixTest : pagoPaApiUrlPrefix
  );

  // Check that profile is up to date (e.g. inbox enabled)
  yield call(checkProfileEnabledSaga, userProfile);

  // Now we fork the tasks that will handle the async requests coming from the
  // UI of the application.
  // Note that the following sagas will be automatically cancelled each time
  // this parent saga gets restarted.

  yield fork(watchLoadUserMetadata, backendClient.getUserMetadata);
  yield fork(watchUpserUserMetadata, backendClient.createOrUpdateUserMetadata);

  yield fork(
    watchUserDataProcessingSaga,
    backendClient.getUserDataProcessingRequest,
    backendClient.postUserDataProcessingRequest
  );

  // Load visible services and service details from backend when requested
  yield fork(watchLoadServicesSaga, backendClient);

  // Load messages when requested
  yield fork(watchMessagesLoadOrCancelSaga, backendClient.getMessages);

  // Load messages when requested
  yield fork(watchMessageLoadSaga, backendClient.getMessage);

  // Load message and related entities (ex. the sender service)
  yield takeEvery(
    getType(loadMessageWithRelations.request),
    loadMessageWithRelationsSaga,
    backendClient.getMessage
  );

  // Watch for the app going to background/foreground
  yield fork(watchApplicationActivitySaga);

  // Watch for requests to logout
  yield spawn(watchLogoutSaga, backendClient.logout);
  // Watch for requests to reset the unlock code.
  yield fork(watchPinResetSaga);
  // Watch for identification request
  yield fork(watchIdentificationRequest, storedPin);

  // Watch for checking the user email notifications preferences
  yield fork(watchEmailNotificationPreferencesSaga);

  // Check if we have a pending notification message
  const pendingMessageState: ReturnType<
    typeof pendingMessageStateSelector
  > = yield select<GlobalState>(pendingMessageStateSelector);

  if (pendingMessageState) {
    // We have a pending notification message to handle
    const messageId = pendingMessageState.id;

    // Remove the pending message from the notification state
    yield put(clearNotificationPendingMessage());

    // Navigate to message details screen
    yield put(navigateToMessageDetailScreenAction({ messageId }));
    // Push the MAIN navigator in the history to handle the back button
    const navigationState: NavigationState = yield select<GlobalState>(
      navigationStateSelector
    );
    yield put(
      navigationHistoryPush(
        AppNavigator.router.getStateForAction(
          NavigationActions.back(),
          navigationState
        )
      )
    );
  } else {
    yield put(navigateToMainNavigatorAction);
  }
}

export function* startupSaga(): IterableIterator<Effect> {
  // Wait until the IngressScreen gets mounted
  yield takeLatest(
    getType(startApplicationInitialization),
    initializeApplicationSaga
  );
}
