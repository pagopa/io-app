/**
 * A saga that manages the Onboarding.
 *
 * @flow
 */

import { type Saga } from 'redux-saga'
import { takeLatest, select, take, call, put } from 'redux-saga/effects'
import { NavigationActions } from 'react-navigation'

import { type GlobalState } from '../reducers/types'
import {
  SESSION_INITIALIZE_SUCCESS,
  TOS_ACCEPT_REQUEST,
  TOS_ACCEPT_SUCCESS,
  PIN_CREATED_REQUEST
} from '../store/actions/constants'
import ROUTES from '../navigation/routes'

// The Pin step of the Onboarding
function* pinStep(): Saga<void> {
  // From the state check ir the user already created a Pin
  const pinCreated: boolean = yield select(
    (state: GlobalState): boolean => state.onboarding.isPinCreated
  )

  if (!pinCreated) {
    // If the Pin has not benn created yet we must show the user the PinScreen
    const navigateAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_PIN })
      ],
      key: ROUTES.ONBOARDING
    })
    yield put(navigateAction)

    // Here we wait the user to create a Pin
    yield take(PIN_CREATED_REQUEST)
  }
}

// The ToS step of the Onboarding
function* tosStep(): Saga<void> {
  // From the state we check if the user already acceppted
  const isTosAccepted: boolean = yield select(
    (state: GlobalState): boolean => state.onboarding.isTosAccepted
  )

  if (!isTosAccepted) {
    // If the ToS is not accepted we must to show the user the TosScreen
    const navigateAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_TOS })
      ],
      key: ROUTES.ONBOARDING
    })
    yield put(navigateAction)

    // Here we wait the user accept the ToS
    yield take(TOS_ACCEPT_REQUEST)

    // Dispatch the action that sets isTosAccepted to true into the store
    yield put({
      type: TOS_ACCEPT_SUCCESS
    })
  } else {
    // Is the ToS is already accepted continue to the Pin step of the Onboarding
    yield call(pinStep)
  }
}

export default function* root(): Saga<void> {
  /**
   * The Onboarding saga need to be started only after the Session saga is fully finished.
   * The SESSION_INITIALIZE_SUCCESS action is dispatched only when the Session is established and valid.
   */
  yield takeLatest(SESSION_INITIALIZE_SUCCESS, tosStep)
}
