/**
 * A reducer that manages the errors for all the actions dispatched.
 * To work the actions need to use the conventional flux/redux naming:
 *
 * - ACTION_NAME_(REQUEST|SUCCESS|FAILURE)
 */

import { Action } from "../../actions/types";
import { GlobalState } from "../../reducers/types";
import { ERROR_CLEAR, FetchRequestActionsType } from "../actions/constants";

export type ErrorState = Readonly<
  Partial<{ [key in FetchRequestActionsType]: string }>
>;

export const INITIAL_STATE: ErrorState = {};

/**
 * Create a selector that returns the first error found if any of the actions
 * passed as parameter is in error.
 * Returns undefined if no action is in error.
 *
 * USAGE: `createErrorSelector(['PROFILE_LOAD', 'PREFERENCES_LOAD'])`
 */
export function createErrorSelector(
  actions: ReadonlyArray<FetchRequestActionsType>
): (_: GlobalState) => string | undefined {
  return state => {
    // Returns first error message found if any
    const errors = actions
      .map(action => state.error[action])
      .filter(message => message !== undefined);
    return errors[0];
  };
}

// Listen for ERROR_CLEAR|*_REQUEST|*_FAILURE actions and set/remove error message.
function reducer(
  state: ErrorState = INITIAL_STATE,
  action: Action
): ErrorState {
  const { type } = action;

  // Clear ERROR explicitly
  if (action.type === ERROR_CLEAR) {
    const newState = Object.assign({}, state);
    delete newState[action.payload];
    return newState;
  }

  const matches = /(.*)_(REQUEST|FAILURE)/.exec(type);

  // Not a *_REQUEST /  *_FAILURE actions, so we ignore them
  if (!matches) {
    return state;
  }

  const [, requestName, requestState] = matches;
  if (requestState === "FAILURE") {
    // We need to set the error message
    return {
      ...state,
      [requestName]: (action as any).payload || "Generic error"
    };
  } else {
    // We need to remove the error message
    const newState = Object.assign({}, state);
    delete newState[requestName];
    return newState;
  }
}

export default reducer;
