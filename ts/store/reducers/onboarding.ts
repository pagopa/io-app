/**
 * A reducer for the Onboarding.
 * @flow
 */

import { TOS_ACCEPT_SUCCESS } from "../actions/constants";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type OnboardingState = Readonly<{
  isTosAccepted: boolean;
}>;

const INITIAL_STATE: OnboardingState = {
  isTosAccepted: false
};

// Selectors
export const isTosAcceptedSelector = (state: GlobalState): boolean =>
  state.onboarding.isTosAccepted;

const reducer = (
  state: OnboardingState = INITIAL_STATE,
  action: Action
): OnboardingState => {
  switch (action.type) {
    case TOS_ACCEPT_SUCCESS:
      return {
        ...state,
        isTosAccepted: true
      };

    default:
      return state;
  }
};

export default reducer;
