/**
 * A reducer for the Onboarding.
 * @flow
 */
import { getType } from "typesafe-actions";

import { fingerprintAcknowledge } from "../actions/onboarding";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type OnboardingState = Readonly<{
  isFingerprintAcknowledged: boolean;
}>;

const INITIAL_STATE: OnboardingState = {
  isFingerprintAcknowledged: false
};

export const isFingerprintAcknowledgedSelector = (
  state: GlobalState
): boolean => state.onboarding.isFingerprintAcknowledged;

const reducer = (
  state: OnboardingState = INITIAL_STATE,
  action: Action
): OnboardingState => {
  switch (action.type) {
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
