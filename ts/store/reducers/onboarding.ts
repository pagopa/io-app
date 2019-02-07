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
  isFingerprintAcknowledged: boolean;
}>;

const INITIAL_STATE: OnboardingState = {
  isTosAccepted: false,
  isFingerprintAcknowledged: false
};

// Selectors
export const isTosAcceptedSelector = (state: GlobalState): boolean =>
  state.onboarding.isTosAccepted;

export const isFingerprintAcknowledgedSelector = (
  state: GlobalState
): boolean => state.onboarding.isFingerprintAcknowledged;

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
        isFingerprintAcknowledged: true
      };

    default:
      return state;
  }
};

export default reducer;
