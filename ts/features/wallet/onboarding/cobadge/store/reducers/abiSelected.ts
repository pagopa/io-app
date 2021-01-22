import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { searchUserBPay, walletAddBPayStart } from "../actions";

export type AbiSelected = string | null;

const abiSelectedReducer = (
  state: AbiSelected = null,
  action: Action
): AbiSelected => {
  switch (action.type) {
    case getType(searchUserBPay.request):
      return action.payload ?? null;
    // reset at the start
    case getType(walletAddBPayStart):
      return null;
  }
  return state;
};

/**
 * Return the abi chosen from the user to search for their BPay
 * @param state
 */
export const onboardingBPayAbiSelectedSelector = (
  state: GlobalState
): string | undefined => state.wallet.onboarding.bPay.abiSelected ?? undefined;

export default abiSelectedReducer;
