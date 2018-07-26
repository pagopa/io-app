/**
 * A saga that manages the Onboarding.
 *
 * For a detailed view of the flow check
 * @https://docs.google.com/document/d/1le-IdjcGWtmfrMzh6d_qTwsnhVNCExbCd6Pt4gX7VGo/edit
 */

import { NavigationActions } from "react-navigation";
import {
  call,
  Effect,
  fork,
  put,
  select,
  take,
  takeLatest
} from "redux-saga/effects";

import { Option } from "fp-ts/lib/Option";
import ROUTES from "../navigation/routes";
import {
  ONBOARDING_CHECK_COMPLETE,
  ONBOARDING_CHECK_PIN,
  ONBOARDING_CHECK_TOS,
  PIN_CREATE_FAILURE,
  PIN_CREATE_SUCCESS,
  PIN_LOGIN_INITIALIZE,
  PROFILE_UPSERT_FAILURE,
  PROFILE_UPSERT_SUCCESS,
  START_ONBOARDING,
  TOS_ACCEPT_REQUEST,
  TOS_ACCEPT_SUCCESS
} from "../store/actions/constants";
import { startPinSet } from "../store/actions/pinset";
import {
  ProfileUpsertFailure,
  profileUpsertRequest,
  ProfileUpsertSuccess
} from "../store/actions/profile";
import { isTosAcceptedSelector } from "../store/reducers/onboarding";
import { profileSelector, ProfileState } from "../store/reducers/profile";
import { PinString } from "../types/PinString";
import { getPin } from "../utils/keychain";

/**
 * The PIN step of the Onboarding
 */
function* pinCheckSaga(): Iterator<Effect> {
  yield take(ONBOARDING_CHECK_PIN);

  // We check whether the user has already created a PIN by trying to retrieve
  // it from the Keychain
  const pinCode: Option<PinString> = yield call(getPin);
  const doesPinExistInKeyChain = pinCode.isSome();

  if (doesPinExistInKeyChain) {
    // since we have an existing PIN code in the keychain,
    // ask the user to login with it
    yield put({
      type: PIN_LOGIN_INITIALIZE
    });
    return;
  }

  // here we loop until a PIN is set (PIN_CREATE_SUCCESS)
  while (true) {
    // If we don't have a PIN code yet, let's set one by starting the PIN flow
    yield put(startPinSet());

    // Wait for the PIN to have been created, or a failure to happen
    const result = yield take([PIN_CREATE_SUCCESS, PIN_CREATE_FAILURE]);

    if (result.type === PIN_CREATE_SUCCESS) {
      break;
    }
  }

  // since we just set a new PIN, we don't ask for it
  yield put({
    type: ONBOARDING_CHECK_COMPLETE
  });
}

/**
 * The ToS step of the Onboarding
 */
function* tosCheckSaga(): Iterator<Effect> {
  yield take(ONBOARDING_CHECK_TOS);
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
            is_webhook_enabled: true
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

  // Dispatch an action to start the next step
  yield put({ type: ONBOARDING_CHECK_PIN });
}

function* onboardingSaga(): Iterator<Effect> {
  yield fork(tosCheckSaga);
  yield fork(pinCheckSaga);

  yield put({ type: ONBOARDING_CHECK_TOS });
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(START_ONBOARDING, onboardingSaga);
}
