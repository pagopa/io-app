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

import ROUTES from "../navigation/routes";
import {
  ONBOARDING_CHECK_COMPLETE,
  ONBOARDING_CHECK_PIN,
  ONBOARDING_CHECK_TOS,
  PIN_CREATE_FAILURE,
  PIN_CREATE_REQUEST,
  PIN_CREATE_SUCCESS,
  PIN_LOGIN_INITIALIZE,
  PROFILE_UPSERT_FAILURE,
  PROFILE_UPSERT_SUCCESS,
  START_ONBOARDING,
  TOS_ACCEPT_REQUEST,
  TOS_ACCEPT_SUCCESS
} from "../store/actions/constants";
import { PinCreateRequest } from "../store/actions/onboarding";
import {
  ProfileUpsertFailure,
  profileUpsertRequest,
  ProfileUpsertSuccess
} from "../store/actions/profile";
import {
  isPinCreatedSelector,
  isTosAcceptedSelector
} from "../store/reducers/onboarding";
import { profileSelector, ProfileState } from "../store/reducers/profile";
import { setPin } from "../utils/keychain";

/**
 * The PIN step of the Onboarding
 */
function* pinCheckSaga(): Iterator<Effect> {
  yield take(ONBOARDING_CHECK_PIN);
  // From the state we check whether the user has already created a PIN
  const isPinCreated: boolean = yield select(isPinCreatedSelector);

  if (!isPinCreated) {
    // Navigate to the PinScreen
    const navigateToOnboardingPinScreenAction = NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING,
      action: NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_PIN })
    });
    yield put(navigateToOnboardingPinScreenAction);
    // Loop until PIN successfully saved in the Keystore
    // tslint:disable-next-line:no-constant-condition
    while (true) {
      // Here we wait the user to create a PIN
      const action: PinCreateRequest = yield take(PIN_CREATE_REQUEST);

      try {
        yield call(setPin, action.payload);

        // Dispatch the action that sets isPinCreated to true into the store
        yield put({ type: PIN_CREATE_SUCCESS });

        break;
      } catch (error) {
        yield put({ type: PIN_CREATE_FAILURE });
      }
    }
  }
  // if pin was created before
  if (!isPinCreated) {
    yield put({
      type: ONBOARDING_CHECK_COMPLETE
    });
  } else {
    yield put({
      type: PIN_LOGIN_INITIALIZE
    });
  }
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

      // We have the profile info but the user hasn't a profile active on API
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
