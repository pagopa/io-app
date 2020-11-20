import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { BancomatPaymentMethod } from "../../../../../../types/pagopa";
import { addBancomatToWallet, walletAddBancomatStart } from "../actions";

const addedPansReducer = (
  state: ReadonlyArray<BancomatPaymentMethod> = [],
  action: Action
): ReadonlyArray<BancomatPaymentMethod> => {
  switch (action.type) {
    // Register a new Bancomat added in the current onboarding session
    case getType(addBancomatToWallet.success):
      return [...state, action.payload];
    // Reset the state when starting a new onboarding bancomat workflow
    case getType(walletAddBancomatStart):
      return [];
  }
  return state;
};

export const onboardingBancomatAddedPansSelector = (
  state: GlobalState
): ReadonlyArray<BancomatPaymentMethod> =>
  state.wallet.onboarding.bancomat.addedPans;

export default addedPansReducer;
