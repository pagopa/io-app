import appState, { initialAppState } from '../appState'
import { APP_STATE_CHANGE_ACTION } from '../../store/actions/constants'
import { ApplicationState, ApplicationStateAction } from '../../actions/types';

describe('appState reducer', () => {
  it('should have a valid initial state', () => {
    expect(appState(undefined, {} as any)).toEqual(initialAppState)
  })

  it('should handle APPLICATION_STATE_CHANGE_ACTION', () => {
    const action: ApplicationStateAction = {
      type: APP_STATE_CHANGE_ACTION,
      payload: 'inactive'
    }
    expect(appState(undefined, action)).toEqual({
      appState: 'inactive'
    })
  })
})
