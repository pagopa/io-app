/**
 * @flow
 */

import { type Saga } from 'redux-saga'
import { takeLatest, put } from 'redux-saga/effects'
import { NavigationActions } from 'react-navigation'

import { ONBOARDING_CHECK_COMPLETE } from '../store/actions/constants'
import ROUTES from '../navigation/routes'

function* mainSaga(): Saga<void> {
  // Navigate to the MainNavigator
  const navigateToMainNavigatorAction = NavigationActions.navigate({
    routeName: ROUTES.MAIN,
    key: null
  })
  yield put(navigateToMainNavigatorAction)
}

export default function* root(): Saga<void> {
  /**
   * The Main saga need to be started only after the Onboarding saga is fully finished.
   * The ONBOARDING_CHECK_COMPLETE action is dispatched only when all the steps of the Onboarding are fulfilled.
   */
  yield takeLatest(ONBOARDING_CHECK_COMPLETE, mainSaga)
}
