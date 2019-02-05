/**
 * A reducer for the Onboarding.
 * @flow
 */
import { getType } from "typesafe-actions";

import { tosAccept } from "../actions/onboarding";
import { fingerprintAcknowledge } from "../actions/onboarding";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type OnboardingState = Readonly<{
  isTosAccepted: boolean;
  isFingerprintAccepted: boolean;
}>;

const INITIAL_STATE: OnboardingState = {
  isTosAccepted: false,
  isFingerprintAccepted: false
};

// Selectors
export const isTosAcceptedSelector = (state: GlobalState): boolean =>
  state.onboarding.isTosAccepted;

export const isFingerprintAcceptedSelector = (state: GlobalState): boolean =>
  state.onboarding.isFingerprintAccepted;

const reducer = (
  state: OnboardingState = INITIAL_STATE,
  action: Action
): OnboardingState => {
  switch (action.type) {
    case getType(tosAccept.success):
      return {
        ...state,
        isTosAccepted: true
      };
    case getType(fingerprintAcknowledge.success):
      return {
        ...state,
        isFingerprintAccepted: true
      };

    default:
      return state;
  }
};

export default reducer;
