/**
 * A saga that manages the Session.
 *
 * @flow
 */

import { type Saga } from 'redux-saga'
import { takeLatest, take, put } from 'redux-saga/effects'
import { NavigationActions } from 'react-navigation'

import { IDP_SELECTED, LOGIN_SUCCESS } from '../store/actions/constants'
import { loadProfile } from '../store/actions/profile'
import ROUTES from '../navigation/routes'

// A saga for the login
function* loginSaga(): Saga<void> {
  // Redirect the user to the IdpLoginScreen
  yield put(
    NavigationActions.navigate({
      routeName: ROUTES.AUTHENTICATION_IDP_LOGIN
    })
  )

  // Wait for LOGIN_SUCCESS action
  yield take(LOGIN_SUCCESS)

  // Fetch the Profile
  yield put(loadProfile())
}

// This function listens for Session related requests and calls the needed saga.
export default function* root(): Saga<void> {
  yield takeLatest(IDP_SELECTED, loginSaga)
}
