/**
 * @flow
 */

'use strict'

import type { Action, ThunkAction, Dispatch, GetState } from './types'
import { getUserProfile } from '../utils/api'

function requestUserProfile(): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch({
      type: 'REQUEST_USER_PROFILE',
    })
    const { apiUrlPrefix, token } = getState().user
    getUserProfile(apiUrlPrefix, token).then((profile) => {
      dispatch(receiveUserProfile(profile))
    })
  }
}

function receiveUserProfile(profile: Object): Action {
  return {
    type: 'RECEIVE_USER_PROFILE',
    profile: profile,
    receivedAt: Date.now(),
  }
}

module.exports = {
  requestUserProfile,
  receiveUserProfile,
}
