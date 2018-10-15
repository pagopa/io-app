import { isNone, Option } from "fp-ts/lib/Option";
import { NavigationActions, NavigationState } from "react-navigation";
import { Effect } from "redux-saga";
import { call, fork, put, race, select, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { BackendClient } from "../api/backend";
import { PagoPaClient } from "../api/pagopa";
import { setInstabugProfileAttributes } from "../boot/configureInstabug";
import { apiUrlPrefix, pagoPaApiUrlPrefix } from "../config";
import { IdentityProvider } from "../models/IdentityProvider";
import AppNavigator from "../navigation/AppNavigator";
import { startApplicationInitialization } from "../store/actions/application";
import { sessionExpired } from "../store/actions/authentication";
import {
  navigateToMainNavigatorAction,
  navigateToMessageDetailScreenAction
} from "../store/actions/navigation";
import { navigationHistoryPush } from "../store/actions/navigationHistory";
import { clearNotificationPendingMessage } from "../store/actions/notifications";
import { resetProfileState } from "../store/actions/profile";
import {
  idpSelector,
  sessionInfoSelector,
  sessionTokenSelector
} from "../store/reducers/authentication";
import { IdentificationResult } from "../store/reducers/identification";
import { navigationStateSelector } from "../store/reducers/navigation";
import {
  PendingMessageState,
  pendingMessageStateSelector
} from "../store/reducers/notifications/pendingMessage";
import { GlobalState } from "../store/reducers/types";
import { PinString } from "../types/PinString";
import { SagaCallReturnType } from "../types/utils";
import { getPin } from "../utils/keychain";
import {
  startAndReturnIdentificationResult,
  watchIdentificationRequest
} from "./identification";
import { updateInstallationSaga } from "./notifications";
import { loadProfile, watchProfileUpsertRequestsSaga } from "./profile";
import { authenticationSaga } from "./startup/authenticationSaga";
import { checkAcceptedTosSaga } from "./startup/checkAcceptedTosSaga";
import { checkConfiguredPinSaga } from "./startup/checkConfiguredPinSaga";
import { checkProfileEnabledSaga } from "./startup/checkProfileEnabledSaga";
import { loadSessionInformationSaga } from "./startup/loadSessionInformationSaga";
import { watchAbortOnboardingSaga } from "./startup/watchAbortOnboardingSaga";
import { watchApplicationActivitySaga } from "./startup/watchApplicationActivitySaga";
import { watchMessagesLoadOrCancelSaga } from "./startup/watchLoadMessagesSaga";
import { watchLoadMessageWithRelationsSaga } from "./startup/watchLoadMessageWithRelationsSaga";
import { watchLogoutSaga } from "./startup/watchLogoutSaga";
import { watchSessionExpiredSaga } from "./startup/watchSessionExpiredSaga";
import { watchWalletSaga } from "./wallet";

/**
 * Handles the application startup and the main application logic loop
 */
// tslint:disable-next-line:cognitive-complexity
function* initializeApplicationSaga(): IterableIterator<Effect> {
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

  // Instantiate a backend client from the session token
  const backendClient = BackendClient(apiUrlPrefix, sessionToken);

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
    yield put(startApplicationInitialization());
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
    // Start again if we can't load the profile
    yield put(startApplicationInitialization());
    return;
  }
  const userProfile = maybeUserProfile.value;
  const maybeIdp: Option<IdentityProvider> = yield select<GlobalState>(
    idpSelector
  );

  setInstabugProfileAttributes(userProfile, maybeIdp);

  // Retrieve the configured PIN from the keychain
  const maybeStoredPin: SagaCallReturnType<typeof getPin> = yield call(getPin);

  // tslint:disable-next-line:no-let
  let storedPin: PinString;

  if (!previousSessionToken || isNone(maybeStoredPin)) {
    // The user wasn't logged in when the application started or, for some
    // reason, he was logged in but there is no PIN set, thus we need
    // to pass through the onboarding process.
    yield call(checkAcceptedTosSaga);

    ({ storedPin } = yield race({
      storedPin: call(checkConfiguredPinSaga),
      // Watch for abort action.
      abortOnboarding: call(watchAbortOnboardingSaga)
    }));
  } else {
    storedPin = maybeStoredPin.value;
    if (!isSessionRefreshed) {
      // The user was previously logged in, so no onboarding is needed
      // The session was valid so the user didn't event had to do a full login,
      // in this case we ask the user to identify using the PIN.
      const identificationResult: SagaCallReturnType<
        typeof startAndReturnIdentificationResult
      > = yield call(startAndReturnIdentificationResult, storedPin);
      if (identificationResult !== IdentificationResult.success) {
        // If we are here the user had chosen to reset the PIN
        yield put(startApplicationInitialization());
        return;
      }
    }
  }

  //
  // User is autenticated, session token is valid
  //

  // the wallet token is available,
  // proceed with starting the "watch wallet" saga
  const pagoPaClient: PagoPaClient = PagoPaClient(
    pagoPaApiUrlPrefix,
    maybeSessionInformation.value.walletToken
  );
  yield fork(watchWalletSaga, sessionToken, pagoPaClient, storedPin);

  // Start watching for profile update requests as the checkProfileEnabledSaga
  // may need to update the profile.
  yield fork(
    watchProfileUpsertRequestsSaga,
    backendClient.createOrUpdateProfile
  );

  // Check that profile is up to date (e.g. inbox enabled)
  yield call(checkProfileEnabledSaga, userProfile);

  // Now we fork the tasks that will handle the async requests coming from the
  // UI of the application.
  // Note that the following sagas will be automatically cancelled each time
  // this parent saga gets restarted.

  // Load messages when requested
  yield fork(
    watchMessagesLoadOrCancelSaga,
    backendClient.getMessages,
    backendClient.getMessage,
    backendClient.getService
  );

  // Load message and related entities (ex. the sender service)
  yield fork(
    watchLoadMessageWithRelationsSaga,
    backendClient.getMessage,
    backendClient.getService
  );

  // Watch for the app going to background/foreground
  yield fork(watchApplicationActivitySaga);
  // Handles the expiration of the session token
  yield fork(watchSessionExpiredSaga);
  // Logout the user by expiring the session
  yield fork(watchLogoutSaga, backendClient.logout);
  // Watch for identification request
  yield fork(watchIdentificationRequest, storedPin);

  // Check if we have a pending notification message
  const pendingMessageState: PendingMessageState = yield select<GlobalState>(
    pendingMessageStateSelector
  );

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
