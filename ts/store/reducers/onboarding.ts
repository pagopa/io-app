/**
 * A reducer for the Onboarding.
 * @flow
 */

import { TOS_ACCEPT_SUCCESS, PIN_CREATE_SUCCESS } from '../actions/constants'
import { Action } from '../../actions/types'
import { GlobalState } from '../../reducers/types'

export type OnboardingState = {
  isTosAccepted: boolean,
  isPinCreated: boolean
}

export const INITIAL_STATE: OnboardingState = {
  isTosAccepted: false,
  isPinCreated: false
}

// Selectors
export const isTosAcceptedSelector = (state: GlobalState): boolean =>
  state.onboarding.isTosAccepted

export const isPinCreatedSelector = (state: GlobalState): boolean =>
  state.onboarding.isPinCreated

const reducer = (
  state: OnboardingState = INITIAL_STATE,
  action: Action
): OnboardingState => {
  switch (action.type) {
    case TOS_ACCEPT_SUCCESS:
      return {
        ...state,
        isTosAccepted: true
      }

    case PIN_CREATE_SUCCESS:
      return {
        ...state,
        isPinCreated: true
      }

    default:
      return state
  }
}

export default reducer
