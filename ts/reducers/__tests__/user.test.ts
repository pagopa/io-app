import user, { initialUserState } from '../user'
import {
  USER_LOGGED_IN_ACTION,
  USER_LOGGED_OUT_ACTION,
  receiveUserProfile
} from '../../actions'

const token = '1c730ae6-f8e8-43ce-971a-2661c808cf92'
const idpId = 'test'
const profile = {
  email: 'account@email.com'
}
const loggedInState = {
  isLoggedIn: true,
  apiUrlPrefix: initialUserState.apiUrlPrefix,
  token: token,
  idpId: idpId
}
const loggedInWithProfileState = {
  ...loggedInState,
  profile: profile
}

describe('user reducer', () => {
  it('should have a valid initial state', () => {
    expect(user(undefined, {})).toEqual(initialUserState)
  })

  it('should handle USER_LOGGED_IN_ACTION', () => {
    const token = '1c730ae6-f8e8-43ce-971a-2661c808cf92'
    const idpId = 'test'
    const testAction = {
      type: USER_LOGGED_IN_ACTION,
      data: {
        token,
        idpId
      }
    }

    expect(user(undefined, testAction)).toEqual(loggedInState)
  })

  it('should handle USER_LOGGED_OUT_ACTION', () => {
    const testAction = {
      type: USER_LOGGED_OUT_ACTION
    }
    expect(user(loggedInState, testAction)).toEqual(initialUserState)
  })

  it('should handle RECEIVE_USER_PROFILE_ACTION', () => {
    expect(user(loggedInState, receiveUserProfile(profile))).toEqual(
      loggedInWithProfileState
    )
  })
})
