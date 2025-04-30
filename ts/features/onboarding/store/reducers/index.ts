/**
 * A reducer for the Onboarding.
 * @flow
 */
import { getType } from "typesafe-actions";
import { clearOnboarding, fingerprintAcknowledged } from "../actions";
import { Action } from "../../../../store/actions/types";
import { sessionExpired } from "../../../authentication/common/store/actions";

export type OnboardingState = Readonly<{
  isFingerprintAcknowledged: boolean;
}>;

const INITIAL_STATE: OnboardingState = {
  isFingerprintAcknowledged: false
};

const reducer = (
  state: OnboardingState = INITIAL_STATE,
  action: Action
): OnboardingState => {
  switch (action.type) {
    case getType(fingerprintAcknowledged):
      return {
        ...state,
        isFingerprintAcknowledged: true
      };
    case getType(sessionExpired):
    case getType(clearOnboarding):
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default reducer;
