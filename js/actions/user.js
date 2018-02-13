/**
 * Defines actions related to the user profile and preferences.
 *
 * @flow
 */

'use strict'

import type { ThunkAction, Dispatch, GetState, Action } from './types'
import type { ApiUserProfile } from '../utils/api'
import { getUserProfile } from '../utils/api'
import { setUserProfile } from '../utils/api'

const REQUEST_USER_PROFILE_ACTION = 'REQUEST_USER_PROFILE_ACTION'
const RECEIVE_USER_PROFILE_ACTION = 'RECEIVE_USER_PROFILE_ACTION'
const REQUEST_UPDATE_USER_PROFILE_ACTION = 'REQUEST_UPDATE_USER_PROFILE_ACTION'
const UPDATE_USER_PROFILE_ERROR_ACTION = 'UPDATE_USER_PROFILE_ERROR_ACTION'

/**
 * Begins an API requests for the user profile to the backend.
 */
function requestUserProfile(): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    // first we dispatch the request action
    dispatch({
      type: REQUEST_USER_PROFILE_ACTION
    })
    const { apiUrlPrefix, token, idpId } = getState().user

    // if the idp is the demo one do not call the backend
    if (idpId === 'demo') {
      dispatch(
        receiveUserProfile({
          token: 'demo',
          spid_idp: 'demo',
          name: 'utente',
          familyname: 'demo',
          fiscal_code: 'TNTDME00A01H501K',
          mobilephone: '06852641',
          email: 'demo@gestorespid.it'
        })
      )
    } else {
      // else make the API call to the backend
      getUserProfile(apiUrlPrefix, token).then(profile => {
        // once we get back the user profile, we trigger the receive action
        // TODO handle unsuccessful retrieval of profile
        // @see https://www.pivotaltracker.com/story/show/153245807
        if (profile !== null) {
          dispatch(receiveUserProfile(profile))
        }
      })
    }
  }
}

function receiveUserProfile(profile: ApiUserProfile): Action {
  return {
    type: RECEIVE_USER_PROFILE_ACTION,
    profile: profile,
    receivedAt: Date.now()
  }
}

/**
 * Begins an API requests update inbox for the user profile to the backend.
 */
function requestUpdateUserProfile(newProfile: object): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    // first we dispatch the request action
    dispatch({
      type: REQUEST_UPDATE_USER_PROFILE_ACTION
    })
    const { apiUrlPrefix, token } = getState().user
    setUserProfile(apiUrlPrefix, token, newProfile).then(payload => {
      if (payload == 500) {
        updateUserProfileError(payload)(dispatch)
      } else {
        receiveUserProfile(payload)(dispatch, getState)
      }
    })
  }
}

function updateUserProfileError(error): Action {
  return (dispatch: Dispatch) => {
    dispatch({
      type: UPDATE_USER_PROFILE_ERROR_ACTION,
      error: error
    })
  }
}

module.exports = {
  requestUserProfile,
  receiveUserProfile,
  requestUpdateUserProfile,
  updateUserProfileError,

  REQUEST_USER_PROFILE_ACTION,
  RECEIVE_USER_PROFILE_ACTION,
  REQUEST_UPDATE_USER_PROFILE_ACTION,
  UPDATE_USER_PROFILE_ERROR_ACTION
}
