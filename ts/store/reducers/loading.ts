/**
 * A reducer that manages loading state for all the actions dispatched.
 * To work the actions need to use the conventional flux/redux naming:
 *
 * - ACTION_NAME_(REQUEST|SUCCESS|FAILURE)
 */

import get from "lodash/get";

import { Action } from "../../actions/types";
import { GlobalState } from "../../reducers/types";
import { FetchRequestActionsType } from "../actions/constants";

export type LoadingState = Readonly<
  { [key in FetchRequestActionsType]: boolean }
>;

export const INITIAL_STATE: LoadingState = {
  PIN_CREATE: false,
  PROFILE_LOAD: false,
  PROFILE_UPDATE: false
};

/**
 * Create a selector that return true only if all the actions passed as
 * parameter are not in loading state.
 *
 * USAGE: `createLoadingSelector(['PROFILE_LOAD', 'PREFERENCES_LOAD'])`
 */
export const createLoadingSelector = (
  actions: ReadonlyArray<FetchRequestActionsType>
): ((_: GlobalState) => boolean | null) => (state: GlobalState): boolean => {
  // Returns true only when all actions are not loading
  return actions.some((action: FetchRequestActionsType): boolean =>
    get(state, `loading.${action}`)
  );
};

// Listen for _REQUEST|_SUCCESS|_FAILURE actions and set/remove loading state.
const reducer = (
  state: LoadingState = INITIAL_STATE,
  action: Action
): LoadingState => {
  const { type } = action;
  const matches = /(.*)_(REQUEST|SUCCESS|FAILURE)/.exec(type);

  // Not a *_REQUEST / *_SUCCESS /  *_FAILURE actions, so we ignore them
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
