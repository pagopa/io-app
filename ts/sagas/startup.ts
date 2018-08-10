import {
  NavigationActions,
  NavigationNavigateActionPayload,
  NavigationState
} from "react-navigation";
import { Effect } from "redux-saga";
import { call, fork, put, select, take, takeLatest } from "redux-saga/effects";

import { isNone, Option } from "fp-ts/lib/Option";

import {
  logoutFailure,
  logoutSuccess,
  sessionExpired,
  sessionInvalid,
  SessionLoadFailure,
  sessionLoadRequest,
  SessionLoadSuccess
} from "../store/actions/authentication";
import {
  APP_STATE_CHANGE_ACTION,
  APPLICATION_INITIALIZED,
  LOGOUT_REQUEST,
  PIN_LOGIN_VALIDATE_REQUEST,
  SESSION_LOAD_FAILURE,
  SESSION_LOAD_SUCCESS,
  START_MAIN,
  START_PIN_RESET
} from "../store/actions/constants";
import { startNotificationInstallationUpdate } from "../store/actions/notifications";
import { profileLoadRequest } from "../store/actions/profile";
import {
  isLoggedInSelector,
  sessionTokenSelector
} from "../store/reducers/authentication";

import { navigateToDeepLink } from "../store/actions/deepLink";
import { deepLinkSelector } from "../store/reducers/deepLink";

import { apiUrlPrefix, backgroundActivityTimeout } from "../config";

import ROUTES from "../navigation/routes";
import {
  PIN_CREATE_FAILURE,
  PIN_CREATE_SUCCESS,
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
import { StartPinReset, startPinSet } from "../store/actions/pinset";
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

import { authenticationSaga } from "./authentication";

import { PinString } from "../types/PinString";
import { SessionToken } from "../types/SessionToken";

import {
  BackendClient,
  BasicResponseTypeWith401,
  SuccessResponse
} from "../api/backend";

import I18n from "i18n-js";
import { applicationInitialized } from "../store/actions/application";

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
      yield put(startPinSet());

      // Wait for the PIN to have been created, or a failure to happen
      const result = yield take([PIN_CREATE_SUCCESS, PIN_CREATE_FAILURE]);

      if (result.type === PIN_CREATE_SUCCESS) {
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
      const basePin: Option<PinString> = yield call(getPin);

      if (isNone(basePin)) {
        // no PIN has been set!
        // invalidate the session
        yield put(sessionInvalid);
        // initialize the app from scratch (forcing an onboarding flow)
        yield put(applicationInitialized);
        return;
      }

      if (basePin.value === userPin) {
        yield put(pinLoginValidateSuccess());
        break;
      } else {
        yield put(pinLoginValidateFailure());
      }
    } catch (error) {
      yield put(pinLoginValidateFailure());
    }
  }
}

function* pinResetSaga(): Iterator<Effect> {
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
export function* watchApplicationActivity(): IterableIterator<Effect> {
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
function* watchLogoutSaga(): Iterator<Effect> {
  while (true) {
    yield take(LOGOUT_REQUEST);

    // Get the SessionToken from the store
    const sessionToken: SessionToken | undefined = yield select(
      sessionTokenSelector
    );

    // Whether the user need to be logged out
    if (sessionToken) {
      const backendClient = BackendClient(apiUrlPrefix, sessionToken);

      // Issue a logout request to the backend, asking to delete the session
      // FIXME: if there's no connectivity to the backend, this request will
      //        block for a while.
      const response:
        | BasicResponseTypeWith401<SuccessResponse>
        | undefined = yield call(backendClient.logout, {});

      if (response && response.status === 200) {
        yield put(logoutSuccess);
      } else {
        // We got a error, send a LOGOUT_FAILURE action so we can log it using Mixpanel
        const error: Error = response
          ? response.value
          : Error(I18n.t("authentication.errors.logout"));
        yield put(logoutFailure(error));
      }
    } else {
      yield put(logoutFailure(Error(I18n.t("authentication.errors.notoken"))));
    }

    // Force the login by expiring the session
    // FIXME: possibly reset the navigation stack as the watcher of
    // SESSION_EXPIRED will save the navigation state and later restore it
    yield put(sessionExpired);
  }
}

/**
 * Saga to handle the application startup
 */
function* applicationInitializedSaga(): IterableIterator<Effect> {
  // Whether the user is logged in
  const isLoggedIn: boolean = yield select(isLoggedInSelector);

  // Only unauthenticated users need onboarding
  const needOnboarding = !isLoggedIn;

  // tslint:disable-next-line:no-let
  let sessionRefreshed = false;

  if (!isLoggedIn) {
    // The user is not logged in, give control to the authentication saga
    // and wait until the user has successfully logged in
    yield call(authenticationSaga);
    sessionRefreshed = true;
  }

  // The user is now logged in

  // Get the session info
  yield put(sessionLoadRequest());

  // Wait until the request is completed
  const action: SessionLoadSuccess | SessionLoadFailure = yield take([
    SESSION_LOAD_SUCCESS,
    SESSION_LOAD_FAILURE
  ]);

  // If we received SESSION_LOAD_FAILURE this means the session is not-valid
  if (action.type === SESSION_LOAD_FAILURE) {
    // Remove the session information from the store
    yield put(sessionInvalid);

    // We can't do much without a valid session, start the initialization from
    // scrach
    yield put(applicationInitialized);
    return;
  }

  // If we are here the user is logged in and the session is loaded and valid

  // Get the profile info
  yield put(profileLoadRequest);

  // Start the notification installation update
  yield put(startNotificationInstallationUpdate);

  if (needOnboarding) {
    // The user wasn't logged in when the application started, thus we need
    // to pass through the onboarding process to check whether he has a valid
    // profile.
    yield call(onboardingSaga);
  } else {
    // The user was previously logged in, so no onboarding is needed
    if (!sessionRefreshed) {
      // The session was valid so the user didn't event had to do a fulllogin,
      // in this case we ask the user to provide the PIN as a "lighter" login
      yield call(pinLoginSaga);
    }
  }

  // Finally we decide whether to navigate to the main screen o a specific
  // screen based on the deep link stored in the state (e.g. coming from a
  // push notification)
  const deepLink: NavigationNavigateActionPayload | null = yield select(
    deepLinkSelector
  );
  if (deepLink) {
    // If a deep link has been set, navigate to deep link...
    yield put(navigateToDeepLink(deepLink));
  } else {
    // ... otherwise to the MainNavigator
    yield put({
      type: START_MAIN
    });
  }

  //
  // Startup of the application is complete
  // Now we start a few background tasks...
  //

  // Watch for the app going to background/foreground
  yield fork(watchApplicationActivity);

  // Logout the user by expiring the session
  yield fork(watchLogoutSaga);

  // Watch for requests to reset the PIN
  yield fork(pinResetSaga);
}

export function* startupSaga(): IterableIterator<Effect> {
  // Wait until the IngressScreen gets mounted
  yield takeLatest(APPLICATION_INITIALIZED, applicationInitializedSaga);
}
