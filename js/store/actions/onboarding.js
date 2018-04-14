/**
 * Action types and action creator related to the Onboarding.
 *
 * @flow
 */

import { TOS_ACCEPT_REQUEST, TOS_ACCEPT_SUCCESS } from './constants'

// Actions
export type TosAcceptRequest = {
  type: typeof TOS_ACCEPT_REQUEST
}
export type TosAcceptSuccess = {
  type: typeof TOS_ACCEPT_SUCCESS
}

export type OnboardingActions = TosAcceptRequest | TosAcceptSuccess

// Creators
export const acceptTos = (): TosAcceptRequest => ({
  type: TOS_ACCEPT_REQUEST
})
