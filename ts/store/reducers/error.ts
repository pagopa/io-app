/**
 * A reducer that manages the errors for all the actions dispatched.
 * To work the actions need to use the conventional flux/redux naming:
 *
 * - ACTION_NAME_(REQUEST|SUCCESS|FAILURE)
 */

import { isSome, none, Option, some } from "fp-ts/lib/Option";

import { ERROR_CLEAR, FetchRequestActionsType } from "../actions/constants";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type ErrorState = Readonly<
  { [key in FetchRequestActionsType]: Option<string> }
>;

const INITIAL_STATE: ErrorState = {
  TOS_ACCEPT: none,
  PIN_CREATE: none,
  PROFILE_LOAD: none,
  PROFILE_UPSERT: none,
  MESSAGE_WITH_RELATIONS_LOAD: none,
  MESSAGES_LOAD: none,
  LOGOUT: none,
  PAYMENT_LOAD: none,
  WALLET_MANAGEMENT_LOAD: none,
  FETCH_WALLETS: none,
  FETCH_TRANSACTIONS: none
};

/**
 * Create a selector that returns the first error found if any of the actions
 * passed as parameter is in error.
 * Returns undefined if no action is in error.
 *
 * USAGE: `createErrorSelector(['PROFILE_LOAD', 'PREFERENCES_LOAD'])`
 */
export function createErrorSelector(
  actions: ReadonlyArray<FetchRequestActionsType>
): (_: GlobalState) => Option<string> {
  return state => {
    // Returns first error message found if any
    const errors = actions.map(action => state.error[action]).filter(isSome);
    return errors.length > 0 ? errors[0] : none;
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
    return {
      ...state,
      [action.payload]: none
    };
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
      [requestName]: some((action as any).payload) || "Generic error"
    };
  } else {
    // We need to remove the error message
    return {
      ...state,
      [requestName]: none
    };
  }
}

export default reducer;
