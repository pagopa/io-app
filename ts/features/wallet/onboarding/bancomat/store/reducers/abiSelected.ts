import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { searchUserPans, walletAddBancomatStart } from "../actions";

export type AbiSelected = string | null;

const abiSelectedReducer = (
  state: AbiSelected = null,
  action: Action
): AbiSelected => {
  switch (action.type) {
    case getType(searchUserPans.request):
      return action.payload ?? null;
    // reset at the start
    case getType(walletAddBancomatStart):
      return null;
  }
  return state;
};

/**
 * Return the abi chosen from the user to search for their bancomat
 * @param state
 */
export const onboardingBancomatAbiSelectedSelector = (
  state: GlobalState
): string | undefined =>
  state.wallet.onboarding.bancomat.abiSelected === null
    ? undefined
    : state.wallet.onboarding.bancomat.abiSelected;

export default abiSelectedReducer;
