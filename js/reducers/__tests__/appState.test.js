import appState, { initialAppState } from '../appState'
import { appStateChange } from '../../actions'

describe('appState reducer', () => {
  it('should have a valid initial state', () => {
    expect(appState(undefined, {})).toEqual(initialAppState)
  })

  it('should handle APPLICATION_STATE_CHANGE_ACTION', () => {
    expect(appState(undefined, appStateChange('inactive'))).toEqual({
      appState: 'inactive'
    })
  })
})
