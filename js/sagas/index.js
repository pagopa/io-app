/**
 * The root saga that forks and includes all the other sagas.
 *
 * @flow
 */

import { type Saga } from 'redux-saga'
import { all, fork } from 'redux-saga/effects'

import profileSaga from './profile'

export default function* root(): Saga<void> {
  yield all([fork(profileSaga)])
}
