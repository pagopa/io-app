import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { loadPans, walletAddBancomatStart } from "../actions";

export type QueryAbi = string | undefined | null;

const abiSelectedReducer = (
  state: QueryAbi = null,
  action: Action
): QueryAbi => {
  switch (action.type) {
    case getType(loadPans.request):
      return action.payload;
    // reset at the start
    case getType(walletAddBancomatStart):
      return undefined;
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
