import { isNone } from "fp-ts/lib/Option";
import { Effect } from "redux-saga";
import { call, fork, put, race, select, takeLatest } from "redux-saga/effects";

import { startApplicationInitialization } from "../store/actions/application";
import { START_APPLICATION_INITIALIZATION } from "../store/actions/constants";
import { navigateToDeepLink } from "../store/actions/deepLink";
import { navigateToMainNavigatorAction } from "../store/actions/navigation";
import { resetProfileState } from "../store/actions/profile";
import {
  sessionInfoSelector,
  sessionTokenSelector
} from "../store/reducers/authentication";
import { deepLinkSelector } from "../store/reducers/deepLink";

import { apiUrlPrefix, pagoPaApiUrlPrefix } from "../config";

import { SagaCallReturnType } from "../types/utils";

import { getPin } from "../utils/keychain";

import { BackendClient } from "../api/backend";

import {
  watchMessagesLoadOrCancelSaga,
  watchNavigateToMessageDetailsSaga
} from "./startup/watchLoadMessagesSaga";

import { updateInstallationSaga } from "./notifications";

import { loadProfile, watchProfileUpsertRequestsSaga } from "./profile";

import { NavigationRoute } from "react-navigation";
import { PagoPaClient } from "../api/pagopa";
import { currentRouteSelector } from "../store/reducers/navigation";
import { authenticationSaga } from "./startup/authenticationSaga";
import { checkAcceptedTosSaga } from "./startup/checkAcceptedTosSaga";
import { checkConfiguredPinSaga } from "./startup/checkConfiguredPinSaga";
import { checkProfileEnabledSaga } from "./startup/checkProfileEnabledSaga";
import { loadSessionInformationSaga } from "./startup/loadSessionInformationSaga";
import { loginWithPinSaga } from "./startup/pinLoginSaga";
import { watchApplicationActivitySaga } from "./startup/watchApplicationActivitySaga";
import { watchLogoutSaga } from "./startup/watchLogoutSaga";
import { watchPinResetSaga } from "./startup/watchPinResetSaga";
import { watchSessionExpiredSaga } from "./startup/watchSessionExpiredSaga";
import { watchWalletSaga } from "./wallet";

/**
 * Handles the application startup and the main application logic loop
 */
function* initializeApplicationSaga(): IterableIterator<Effect> {
  // Reset the profile cached in redux: at each startup we want to load a fresh
  // user profile.
  yield put(resetProfileState);

  // Whether the user is currently logged in.
  const previousSessionToken: ReturnType<
    typeof sessionTokenSelector
  > = yield select(sessionTokenSelector);

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
  // FIXME: handle result
  yield fork(updateInstallationSaga, backendClient.createOrUpdateInstallation);

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
  > = yield select(sessionInfoSelector);
  if (isSessionRefreshed || maybeSessionInformation.isNone()) {
    // let's try to load the session information from the backend.
    maybeSessionInformation = yield call(
      loadSessionInformationSaga,
      backendClient.getSession
    );
    if (maybeSessionInformation.isNone()) {
      // we can't go further without session info, let's restart
      // the initialization process
      yield put(startApplicationInitialization);
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
    yield put(startApplicationInitialization);
    return;
  }
  const userProfile = maybeUserProfile.value;

  // Retrieve the configured PIN from the keychain
  const storedPin: SagaCallReturnType<typeof getPin> = yield call(getPin);

  if (!previousSessionToken || isNone(storedPin)) {
    // The user wasn't logged in when the application started or, for some
    // reason, he was logged in but there is no PIN sed, thus we need
    // to pass through the onboarding process.
    yield call(checkAcceptedTosSaga);
    yield call(checkConfiguredPinSaga);
  } else if (!isSessionRefreshed) {
    // The user was previously logged in, so no onboarding is needed
    // The session was valid so the user didn't event had to do a full login,
    // in this case we ask the user to provide the PIN as a "lighter" login
    yield race({
      login: call(loginWithPinSaga, storedPin.value),
      reset: call(watchPinResetSaga)
    });
  }

  //
  // User is autenticated, session token is valid
  //

  // the wallet token is available,
  // proceed with starting the "watch wallet" saga
  const pagoPaClient: PagoPaClient = PagoPaClient(pagoPaApiUrlPrefix);
  yield fork(
    watchWalletSaga,
    pagoPaClient,
    maybeSessionInformation.value.walletToken
  );

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
  // Navigate to message details when requested
  yield fork(
    watchNavigateToMessageDetailsSaga,
    backendClient.getMessage,
    backendClient.getService
  );
  // Watch for the app going to background/foreground
  yield fork(watchApplicationActivitySaga);
  // Handles the expiration of the session token
  yield fork(watchSessionExpiredSaga);
  // Logout the user by expiring the session
  yield fork(watchLogoutSaga, backendClient.logout);
  // Watch for requests to reset the PIN
  yield fork(watchPinResetSaga);

  // Finally we decide where to navigate to based on whether we have a deep link
  // stored in the state (e.g. coming from a push notification or from a
  // previously stored navigation state)
  const deepLink: ReturnType<typeof deepLinkSelector> = yield select(
    deepLinkSelector
  );

  const currentRoute: NavigationRoute = yield select(currentRouteSelector);

  if (deepLink) {
    // If a deep link has been set, navigate to deep link...
    yield put(navigateToDeepLink(deepLink, currentRoute.key));
  } else {
    // ... otherwise to the MainNavigator
    yield put(navigateToMainNavigatorAction(currentRoute.key));
  }
}

export function* startupSaga(): IterableIterator<Effect> {
  // Wait until the IngressScreen gets mounted
  yield takeLatest(START_APPLICATION_INITIALIZATION, initializeApplicationSaga);
}
