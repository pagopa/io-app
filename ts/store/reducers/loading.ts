/**
 * A reducer that manages loading state for all the actions dispatched.
 * To work the actions need to use the conventional flux/redux naming:
 *
 * - ACTION_NAME_(REQUEST|CANCEL|SUCCESS|FAILURE)
 */

import { FetchRequestActionsType } from "../actions/constants";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type LoadingState = Readonly<
  { [key in FetchRequestActionsType]: boolean }
>;

export const INITIAL_STATE: LoadingState = {
  PIN_CREATE: false,
  PROFILE_LOAD: false,
  PROFILE_UPSERT: false,
  MESSAGES_LOAD: false
};

/**
 * Create a selector that returns true if any of the actions passed as parameter
 * is in "loading" state.
 *
 * USAGE: `createLoadingSelector(['PROFILE_LOAD', 'PREFERENCES_LOAD'])`
 */
export const createLoadingSelector = (
  actions: ReadonlyArray<FetchRequestActionsType>
): ((_: GlobalState) => boolean) => (state: GlobalState): boolean => {
  return actions.some(
    (action: FetchRequestActionsType): boolean => state.loading[action]
  );
};

// Listen for _REQUEST|_CANCEL|_SUCCESS|_FAILURE actions and set/remove loading state.
const reducer = (
  state: LoadingState = INITIAL_STATE,
  action: Action
): LoadingState => {
  const { type } = action;
  const matches = /(.*)_(REQUEST|CANCEL|SUCCESS|FAILURE)/.exec(type);

  // Not a *_REQUEST / *_CANCEL / *_SUCCESS /  *_FAILURE action, so we ignore it
  if (!matches) {
    return state;
  }

  const [, requestName, requestState] = matches;
  return {
    ...state,
    // Store whether a request is happening at the moment or not
    [requestName]: requestState === "REQUEST"
  };
};

export default reducer;
