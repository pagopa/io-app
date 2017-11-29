/**
 * Defines actions related to the user profile and preferences.
 *
 * @flow
 */

'use strict'

import type { ThunkAction, Dispatch, GetState } from './types'
import type { ApiUserProfile } from '../utils/api'
import { getUserProfile } from '../utils/api'

const REQUEST_USER_PROFILE_ACTION = 'REQUEST_USER_PROFILE_ACTION'
const RECEIVE_USER_PROFILE_ACTION = 'RECEIVE_USER_PROFILE_ACTION'

/**
 * Begins an API requests for the user profile to the backend.
 */
function requestUserProfile(): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    // first we dispatch the request action
    dispatch({
      type: REQUEST_USER_PROFILE_ACTION,
    })
    const { apiUrlPrefix, token, idpId } = getState().user

    // if the idp is the demo one do not call the backend
    if(idpId === 'demo') {
      receiveUserProfile({
        token: 'demo',
        spid_idp: 'demo',
        name: 'utente',
        familyname: 'demo',
        fiscalnumber: 'TNTDME00A01H501K',
        mobilephone: '06852641',
        email: 'demo@gestorespid.it',
      })(dispatch, getState)
    } else {
      // else make the API call to the backend
      getUserProfile(apiUrlPrefix, token).then((profile) => {
        // once we get back the user profile, we trigger the receive action
        // TODO handle unsuccessful retrieval of profile
        // @see https://www.pivotaltracker.com/story/show/153245807
        if(profile !== null) {
          receiveUserProfile(profile)(dispatch, getState)
        }
      })
    }
  }
}

function receiveUserProfile(profile: ApiUserProfile): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch({
      type: RECEIVE_USER_PROFILE_ACTION,
      profile: profile,
      receivedAt: Date.now(),
    })
  }
}

module.exports = {
  requestUserProfile,
  receiveUserProfile,
  REQUEST_USER_PROFILE_ACTION,
  RECEIVE_USER_PROFILE_ACTION
}
