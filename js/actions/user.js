/**
 * Defines actions related to the user profile and preferences.
 *
 * @flow
 */

import { type GetState, type Dispatch, type Action, type Thunk } from './types'
import { type ApiUserProfile, type ApiNewUserProfile } from '../utils/api'
import { getUserProfile } from '../utils/api'
import { setUserProfile } from '../utils/api'

import I18n from '../i18n'

const REQUEST_USER_PROFILE_ACTION = 'REQUEST_USER_PROFILE_ACTION'
const RECEIVE_USER_PROFILE_ACTION = 'RECEIVE_USER_PROFILE_ACTION'
const UPDATE_USER_PROFILE_REQUEST_ACTION = 'UPDATE_USER_PROFILE_REQUEST_ACTION'
const UPDATE_USER_PROFILE_ERROR_ACTION = 'UPDATE_USER_PROFILE_ERROR_ACTION'

// Creators
function receiveUserProfile(profile: ApiUserProfile): Action {
  return {
    type: RECEIVE_USER_PROFILE_ACTION,
    profile: profile,
    receivedAt: Date.now()
  }
}

function updateUserProfileError(): Action {
  return {
    type: UPDATE_USER_PROFILE_ERROR_ACTION,
    data: {
      error: I18n.t('errors.profileUpdateError')
    }
  }
}

/**
 * Begins an API requests for the user profile to the backend.
 */
function requestUserProfile(): Thunk {
  return (dispatch: Dispatch, getState: GetState) => {
    const user = getState().user
    // If the user is not logged in we can't request the profile
    if (!user.isLoggedIn) {
      return
    }

    // First we dispatch the request action
    dispatch({
      type: REQUEST_USER_PROFILE_ACTION
    })
    const { apiUrlPrefix, token, idpId } = user

    // if the idp is the demo one do not call the backend
    if (idpId === 'demo') {
      dispatch(
        receiveUserProfile({
          family_name: 'demo',
          fiscal_code: 'TNTDME00A01H501K',
          has_profile: false,
          name: 'demo',
          version: 0
        })
      )
    } else {
      // else make the API call to the backend
      getUserProfile(apiUrlPrefix, token).then(profile => {
        // once we get back the user profile, we trigger the receive action
        // TODO handle unsuccessful retrieval of profile
        // @see https://www.pivotaltracker.com/story/show/153245807
        if (profile) {
          dispatch(receiveUserProfile(profile))
        }
      })
    }
  }
}

/**
 * Begins an API requests update inbox for the user profile to the backend.
 */
function updateUserProfile(newProfile: ApiNewUserProfile): Thunk {
  return (dispatch: Dispatch, getState: GetState) => {
    const user = getState().user
    // If the user is not logged in we can't request the profile
    if (!user.isLoggedIn) {
      return
    }

    // First we dispatch the request action
    dispatch({
      type: UPDATE_USER_PROFILE_REQUEST_ACTION
    })
    const { apiUrlPrefix, token } = user
    setUserProfile(apiUrlPrefix, token, newProfile).then(profile => {
      if (profile) {
        if (typeof profile === 'number') {
          dispatch(updateUserProfileError())
        } else {
          dispatch(receiveUserProfile(profile))
        }
      }
    })
  }
}

module.exports = {
  requestUserProfile,
  updateUserProfile,
  receiveUserProfile,
  updateUserProfileError,

  REQUEST_USER_PROFILE_ACTION,
  RECEIVE_USER_PROFILE_ACTION,
  UPDATE_USER_PROFILE_REQUEST_ACTION,
  UPDATE_USER_PROFILE_ERROR_ACTION
}
