import {
  NavigationActions,
  NavigationNavigateActionPayload,
  NavigationState,
  StackActions
} from "react-navigation";
import { Effect } from "redux-saga";
import {
  call,
  fork,
  put,
  race,
  select,
  take,
  takeLatest
} from "redux-saga/effects";

import { isNone, Option } from "fp-ts/lib/Option";

import {
  logoutFailure,
  logoutSuccess,
  sessionExpired,
  sessionInformationLoadFailure,
  sessionInformationLoadSuccess,
  sessionInvalid
} from "../store/actions/authentication";
import {
  APP_STATE_CHANGE_ACTION,
  APPLICATION_INITIALIZED,
  LOGIN_SUCCESS,
  LOGOUT_REQUEST,
  PIN_LOGIN_VALIDATE_REQUEST,
  SESSION_EXPIRED,
  START_PIN_RESET
} from "../store/actions/constants";
import { startNotificationInstallationUpdate } from "../store/actions/notifications";
import {
  isLoggedInSelector,
  sessionInfoSelector,
  sessionTokenSelector
} from "../store/reducers/authentication";

import { navigateToDeepLink } from "../store/actions/deepLink";
import { deepLinkSelector } from "../store/reducers/deepLink";

import { apiUrlPrefix, backgroundActivityTimeout } from "../config";

import ROUTES from "../navigation/routes";
import {
  PROFILE_UPSERT_FAILURE,
  PROFILE_UPSERT_SUCCESS,
  TOS_ACCEPT_REQUEST,
  TOS_ACCEPT_SUCCESS
} from "../store/actions/constants";
import { navigationRestore } from "../store/actions/navigation";
import {
  pinLoginValidateFailure,
  PinLoginValidateRequest,
  pinLoginValidateSuccess
} from "../store/actions/pinlogin";
import {
  ProfileUpsertFailure,
  profileUpsertRequest,
  ProfileUpsertSuccess
} from "../store/actions/profile";
import {
  ApplicationState,
  ApplicationStateAction
} from "../store/actions/types";
import { navigationStateSelector } from "../store/reducers/navigation";
import { isTosAcceptedSelector } from "../store/reducers/onboarding";
import { profileSelector, ProfileState } from "../store/reducers/profile";

import { deletePin, getPin } from "../utils/keychain";

import { PinString } from "../types/PinString";
import { SessionToken } from "../types/SessionToken";

import {
  BackendClient,
  BasicResponseTypeWith401,
  GetSessionT,
  LogoutT,
  SuccessResponse
} from "../api/backend";

import I18n from "i18n-js";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { PublicSession } from "../../definitions/backend/PublicSession";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../store/actions/analytics";
import { applicationInitialized } from "../store/actions/application";
import {
  watchMessagesLoadOrCancelSaga,
  watchNavigateToMessageDetailsSaga
} from "./messages";
import { configurePinSaga } from "./pinset";
import { loadProfile } from "./profile";

// tslint:disable-next-line:cognitive-complexity
function* onboardingSaga(): Iterator<Effect> {
  //
  // Fhe first step of the onboarding is to accept the ToS
  //

  // From the state we check whether the user has already accepted the ToS
  const isTosAccepted: boolean = yield select(isTosAcceptedSelector);

  if (!isTosAccepted) {
    // Navigate to the TosScreen
    const navigateToOnboardingTosScreenAction = NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING,
      action: NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_TOS })
    });
    yield put(navigateToOnboardingTosScreenAction);

    // Loop until this step is fulfilled: TOS accepted and if necessary Profile upserted.
    while (true) {
      // Here we wait the user accept the ToS
      yield take(TOS_ACCEPT_REQUEST);

      // Get the current user profile from the store
      const userProfile: ProfileState = yield select(profileSelector);

      // We have the profile info but the user doesn't yet have an active profile in the CD APIs
      // NOTE: `has_profile` is a boolean that is true if the profile is active in the API
      if (userProfile && !userProfile.has_profile) {
        // Upsert the user profile to enable inbox and webhook
        // FIXME: make this a call to the profileUpsert saga
        yield put(
          profileUpsertRequest({
            is_inbox_enabled: true,
            is_webhook_enabled: true,
            email: userProfile.spid_email
          })
        );

        const action: ProfileUpsertSuccess | ProfileUpsertFailure = yield take([
          PROFILE_UPSERT_SUCCESS,
          PROFILE_UPSERT_FAILURE
        ]);

        // We got an error
        if (action.type === PROFILE_UPSERT_FAILURE) {
          // Continue the loop to let the user retry.
          continue;
        }
      }

      // Dispatch the action that sets isTosAccepted to true into the store
      yield put({ type: TOS_ACCEPT_SUCCESS });

      break;
    }
  }

  //
  // The second step is to configure the PIN
  //

  // We check whether the user has already created a PIN by trying to retrieve
  // it from the Keychain
  const pinCode: Option<PinString> = yield call(getPin);
  const doesPinExistInKeyChain = pinCode.isSome();

  if (!doesPinExistInKeyChain) {
    // Here we loop until a PIN is set (PIN_CREATE_SUCCESS)
    while (true) {
      // If we don't have a PIN code yet, let's set one by starting the PIN flow
      const configurePinResult: boolean = yield call(configurePinSaga);
      // FIXME: handle errors
      if (configurePinResult) {
        break;
      }
    }
  }
}

/**
 * The PIN step of the pin login
 */
function* pinLoginSaga(): Iterator<Effect> {
  const navigateToPinLoginNavigatorAction = NavigationActions.navigate({
    routeName: ROUTES.PIN_LOGIN,
    key: undefined
  });
  yield put(navigateToPinLoginNavigatorAction);

  while (true) {
    // loop until the PIN validation succeeds or the user asks to reset the PIN
    try {
      const action: PinLoginValidateRequest = yield take([
        PIN_LOGIN_VALIDATE_REQUEST
      ]);

      const userPin = action.payload;
      const storedPin: Option<PinString> = yield call(getPin);

      if (isNone(storedPin)) {
        // no PIN has been set!
        // invalidate the session
        yield put(sessionInvalid);
        // initialize the app from scratch (forcing an onboarding flow)
        yield put(applicationInitialized);
        return;
      }

      if (storedPin.value === userPin) {
        yield put(pinLoginValidateSuccess());
        return;
      } else {
        yield put(pinLoginValidateFailure());
      }
    } catch (error) {
      yield put(pinLoginValidateFailure());
    }
  }
}

function* watchPinResetSaga(): Iterator<Effect> {
  while (true) {
    yield take(START_PIN_RESET);
    // and delete the current PIN from the Keychain
    // tslint:disable-next-line:saga-yield-return-type
    yield call(deletePin);
    // invalidate the session
    yield put(sessionInvalid);
    // initialize the app from scratch (forcing an onboarding flow)
    yield put(applicationInitialized);
  }
}

/**
 * Listen to APP_STATE_CHANGE_ACTION and if needed force the user to provide
 * the PIN
 */
// tslint:disable-next-line:cognitive-complexity
export function* watchApplicationActivitySaga(): IterableIterator<Effect> {
  const backgroundActivityTimeoutMillis = backgroundActivityTimeout * 1000;

  // tslint:disable-next-line:no-let
  let lastState: ApplicationState = "active";
  // tslint:disable-next-line:no-let
  let lastUpdateAtMillis: number | undefined;

  // We will use this to save and then restore the navigation
  // FIXME: Navigation's saga INITIAL_STATE should not leak here!
  // tslint:disable-next-line:no-let
  let navigationState: NavigationState | undefined;

  while (true) {
    // listen for changes in application state
    const action: ApplicationStateAction = yield take(APP_STATE_CHANGE_ACTION);
    const newApplicationState: ApplicationState = action.payload;

    // get the time elapsed from the last change in state
    const nowMillis = new Date().getTime();
    const timeElapsedMillis = lastUpdateAtMillis
      ? nowMillis - lastUpdateAtMillis
      : nowMillis;

    if (lastState !== "background" && newApplicationState === "background") {
      // The app is going into background

      // Save the navigation state so we can restore in case the PIN login is needed
      // tslint:disable-next-line:saga-yield-return-type
      navigationState = yield select(navigationStateSelector);

      // Make sure that when the app come back active, the BackgrounScreen
      // gets loaded first
      yield put(
        NavigationActions.navigate({
          routeName: ROUTES.BACKGROUND
        })
      );
    } else if (lastState === "background" && newApplicationState === "active") {
      // The app is coming back active after being in background

      if (timeElapsedMillis > backgroundActivityTimeoutMillis) {
        // If the app has been in background state for more that the timeout
        // we may need to ask the user to provide the PIN

        // Whether the user was authenticated
        const isAuthenticated: boolean = yield select(isLoggedInSelector);

        // Whether the user had a PIN configured
        const maybePin: Option<PinString> = yield call(getPin);
        const hasPin = maybePin.isSome();

        if (isAuthenticated && hasPin) {
          // We ask the user to provide a PIN only of the user was previously
          // authenticated and he had a PIN configured.

          // Start the PIN authentication and wwait until the user has
          // successfully provided the PIN
          yield call(pinLoginSaga);
        }
      }

      // Now either the user wasnt's fully authenticated or, if it was, we
      // asked him to provide the PIN and he did successfully.
      // We can the navigation to the previous state.
      if (navigationState) {
        yield put(navigationRestore(navigationState));
      }
    }

    // Update the last state and update time
    lastState = newApplicationState;
    lastUpdateAtMillis = nowMillis;
  }
}

/**
 * Handles the logout flow
 */
// tslint:disable-next-line:cognitive-complexity
function* watchLogoutSaga(logout: TypeofApiCall<LogoutT>): Iterator<Effect> {
  while (true) {
    yield take(LOGOUT_REQUEST);

    // Issue a logout request to the backend, asking to delete the session
    // FIXME: if there's no connectivity to the backend, this request will
    //        block for a while.
    const response:
      | BasicResponseTypeWith401<SuccessResponse>
      | undefined = yield call(logout, {});

    if (response && response.status === 200) {
      yield put(logoutSuccess);
    } else {
      // We got a error, send a LOGOUT_FAILURE action so we can log it using Mixpanel
      const error: Error = response
        ? response.value
        : Error(I18n.t("authentication.errors.logout"));
      yield put(logoutFailure(error));
    }

    // Force the login by expiring the session
    // FIXME: possibly reset the navigation stack as the watcher of
    // SESSION_EXPIRED will save the navigation state and later restore it
    yield put(sessionExpired);
  }
}

/**
 * Load session info from the Backend
 */
function* loadSessionInformationSaga(
  getSession: TypeofApiCall<GetSessionT>
): IterableIterator<Effect | boolean> {
  // Call the Backend service
  const response:
    | BasicResponseTypeWith401<PublicSession>
    | undefined = yield call(getSession, {});

  if (response && response.status === 200) {
    // Ok we got a valid response, send a SESSION_LOAD_SUCCESS action
    yield put(sessionInformationLoadSuccess(response.value));
    return true;
  }

  // We got a error, send a SESSION_LOAD_FAILURE action
  const error: Error = response
    ? response.value
    : Error("Invalid server response");
  yield put(sessionInformationLoadFailure(error));
  return false;
}

/**
 * Handles the expiration of session while the user is using the app.
 *
 * On session expiration (SESSION_EXPIRED action):
 * 1) Saves the navigation state
 * 2) Asks the user to re-authenticate with SPID
 * 3) Restores the navigation state to bring the user back to the screen he was
 *
 * NOTE: This saga handles SESSION_EXPIRED actions one by one, this means that
 * if more than one SESSION_EXPIRED action get dispatched at the same time, only
 * one get served.
 * FIXME: the above statement is not clear, are *all* SESSION_EXPIRED actions
 * going to be processed one by one, or just the first one, or the latest?
 */
export function* watchSessionExpiredSaga(): IterableIterator<Effect> {
  while (true) {
    // Wait for a SESSION_EXPIRED action
    yield take(SESSION_EXPIRED);

    // Get the navigation state from the store so we can restore it back
    const navigationState: NavigationState = yield select(
      navigationStateSelector
    );

    // Restart the authentication flow
    yield call(authenticationSaga);

    // Restore the navigation state to bring the user back to the screen it was before the logout
    yield put(navigationRestore(navigationState));
  }
}

/**
 * A saga that manages the user authentication.
 */
export function* authenticationSaga(): Iterator<Effect> {
  yield put(analyticsAuthenticationStarted);

  // Reset the navigation stack and navigate to the authentication screen
  yield put(
    StackActions.reset({
      index: 0,
      key: null,
      actions: [
        NavigationActions.navigate({
          routeName: ROUTES.AUTHENTICATION
        })
      ]
    })
  );

  // Wait until the user has successfully logged in with SPID
  yield take(LOGIN_SUCCESS);

  // User logged in successfully dispatch an AUTHENTICATION_COMPLETED action.
  // FIXME: what's the difference between AUTHENTICATION_COMPLETED and
  //        LOGIN_SUCCESS?
  yield put(analyticsAuthenticationCompleted);
}

function* loginUntilValidSessionTokenSaga(): IterableIterator<
  Effect | SessionToken
> {
  while (true) {
    yield call(authenticationSaga);
    const maybeSessionToken: SessionToken | undefined = yield select(
      sessionTokenSelector
    );
    if (maybeSessionToken) {
      return maybeSessionToken;
    }
  }
}

/**
 * Saga to handle the application startup
 */
function* applicationInitializedSaga(): IterableIterator<Effect> {
  // Whether the user is currently logged in.
  const previousSessionToken: SessionToken | undefined = yield select(
    sessionTokenSelector
  );

  // Unless we have a valid session token already, login until we have one.
  const sessionToken: SessionToken = previousSessionToken
    ? previousSessionToken
    : yield call(loginUntilValidSessionTokenSaga);

  // Instantiate a backend client from the session token
  const backendClient = BackendClient(apiUrlPrefix, sessionToken);

  // whether we asked the user to login again
  const isSessionRefreshed = previousSessionToken !== sessionToken;

  // Let's see if have to load the session info, either because
  // we don't have one for the current session or because we
  // just refreshed the session.
  // FIXME: since it looks like we load the session info every
  //        time we get a session token, think about merging the
  //        two steps.
  const maybeSessionInformation: Option<PublicSession> = yield select(
    sessionInfoSelector
  );
  if (isSessionRefreshed || maybeSessionInformation.isNone()) {
    // let's try to load the session information from the backend.
    const result: boolean = yield call(
      loadSessionInformationSaga,
      backendClient.getSession
    );
    if (!result) {
      // we can't go further without session info, let's restart
      // the initialization process
      yield put(applicationInitialized);
      return;
    }
  }

  // If we are here the user is logged in and the session info is
  // loaded and valid

  // Get the profile info
  const loadProfileResult: boolean = yield call(
    loadProfile,
    backendClient.getProfile
  );
  if (loadProfileResult === false) {
    // Start again if we can't load the profile
    yield put(applicationInitialized);
    return;
  }

  // Start the notification installation update
  yield put(startNotificationInstallationUpdate);

  // Whether the user has a PIN
  const storedPin: Option<PinString> = yield call(getPin);

  if (!previousSessionToken || storedPin.isNone()) {
    // The user wasn't logged in when the application started or, for some
    // reason, he was logged in but there is no PIN sed, thus we need
    // to pass through the onboarding process to check whether he has a valid
    // profile.
    yield call(onboardingSaga);
  } else if (!isSessionRefreshed) {
    // The user was previously logged in, so no onboarding is needed
    // The session was valid so the user didn't event had to do a full login,
    // in this case we ask the user to provide the PIN as a "lighter" login
    yield race({ login: call(pinLoginSaga), reset: call(watchPinResetSaga) });
  }

  //
  // User is autenticated, session token is valid and profile is up to date.
  //

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
  // stored in the state (e.g. coming from a push notification)
  const deepLink: NavigationNavigateActionPayload | null = yield select(
    deepLinkSelector
  );
  if (deepLink) {
    // If a deep link has been set, navigate to deep link...
    yield put(navigateToDeepLink(deepLink));
  } else {
    // ... otherwise to the MainNavigator
    const navigateToMainNavigatorAction = NavigationActions.navigate({
      routeName: ROUTES.MAIN,
      key: undefined
    });
    yield put(navigateToMainNavigatorAction);
  }
}

export function* startupSaga(): IterableIterator<Effect> {
  // Wait until the IngressScreen gets mounted
  yield takeLatest(APPLICATION_INITIALIZED, applicationInitializedSaga);
}
