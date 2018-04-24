import appState, { initialAppState } from '../appState'
import { APP_STATE_CHANGE_ACTION } from '../../store/actions/constants'

describe('appState reducer', () => {
  it('should have a valid initial state', () => {
    expect(appState(undefined, {})).toEqual(initialAppState)
  })

  it('should handle APPLICATION_STATE_CHANGE_ACTION', () => {
    const action = {
      type: APP_STATE_CHANGE_ACTION,
      payload: 'inactive'
    }
    expect(appState(undefined, action)).toEqual({
      appState: 'inactive'
    })
  })
})
