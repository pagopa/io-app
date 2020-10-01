import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { bpdLoadActivationStatus } from "../../actions/details";
import { bpdOnboardingCancel, bpdUserActivate } from "../../actions/onboarding";

/**
 * This reducers is used to know if a current onboarding is ongoing
 * @param state
 * @param action
 */
const ongoingOnboardingReducer = (
  state: boolean = false,
  action: Action
): boolean => {
  switch (action.type) {
    case getType(bpdUserActivate):
      return true;
    case getType(bpdOnboardingCancel):
      return false;
    case getType(bpdLoadActivationStatus.success):
      return action.payload.enabled ? false : state;
    // TODO: check when moving the bpdLoadActivationStatus.success in the wallet if the value is ok
  }
  return state;
};

/**
 * Return true if the user is the ongoing workflow
 * @param state
 */
export const isBpdOnboardingOngoing = (state: GlobalState) => false;
// state.bonus.bpd.onboarding.ongoing;

export default ongoingOnboardingReducer;
