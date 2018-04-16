import { APPLICATION_INITIALIZED } from './constants'

/**
 * Action types and action creator related to the Application.
 *
 * @flow
 */

// Actions
export type ApplicationInitialized = {
  type: typeof APPLICATION_INITIALIZED
}

// Creators
export const applicationInitialized = (): ApplicationInitialized => ({
  type: APPLICATION_INITIALIZED
})

export type ApplicationActions = ApplicationInitialized
