/**
 * All the actions related costants.
 *
 * @flow
 */

// Application
export const APP_STATE_CHANGE_ACTION: 'APP_STATE_CHANGE_ACTION' =
  'APP_STATE_CHANGE_ACTION'

// Profile
export const PROFILE_LOAD_REQUEST: 'PROFILE_LOAD_REQUEST' =
  'PROFILE_LOAD_REQUEST'
export const PROFILE_LOAD_SUCCESS: 'PROFILE_LOAD_SUCCESS' =
  'PROFILE_LOAD_SUCCESS'
export const PROFILE_LOAD_FAILURE: 'PROFILE_LOAD_FAILURE' =
  'PROFILE_LOAD_FAILURE'

export const PROFILE_UPDATE_REQUEST: 'PROFILE_UPDATE_REQUEST' =
  'PROFILE_UPDATE_REQUEST'
export const PROFILE_UPDATE_SUCCESS: 'PROFILE_UPDATE_SUCCESS' =
  'PROFILE_UPDATE_SUCCESS'
export const PROFILE_UPDATE_FAILURE: 'PROFILE_UPDATE_FAILURE' =
  'PROFILE_UPDATE_FAILURE'

// Costants for actions that need UI state reducers
export const FetchRequestActions = {
  PROFILE_LOAD: 'PROFILE_LOAD',
  PROFILE_UPDATE: 'PROFILE_UPDATE'
}

// Extract keys from object and create a new union type
export type FetchRequestActionsType = $Keys<typeof FetchRequestActions>
