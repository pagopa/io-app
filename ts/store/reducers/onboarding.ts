/**
 * A reducer for the Onboarding.
 * @flow
 */
import { getType } from "typesafe-actions";

import { tosAcceptSuccess } from "../actions/onboarding";
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
    case getType(tosAcceptSuccess):
      return {
        ...state,
        isTosAccepted: true
      };

    default:
      return state;
  }
};

export default reducer;
