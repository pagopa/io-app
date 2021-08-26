import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { bpdIbanInsertionCancel } from "../../actions/iban";
import {
  bpdOnboardingCancel,
  bpdOnboardingCompleted,
  bpdUserActivate
} from "../../actions/onboarding";

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
    case getType(bpdOnboardingCompleted):
    case getType(bpdIbanInsertionCancel):
      return false;
  }
  return state;
};

/**
 * Return true if the user is the ongoing workflow
 * @param state
 */
export const isBpdOnboardingOngoing = (state: GlobalState) =>
  state.bonus.bpd.onboarding.ongoing;

export default ongoingOnboardingReducer;
