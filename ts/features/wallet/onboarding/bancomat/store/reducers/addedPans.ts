import { getType } from "typesafe-actions";
import { WalletV2 } from "../../../../../../../definitions/pagopa/bancomat/WalletV2";
import { Action } from "../../../../../../store/actions/types";
import { addBancomatToWallet, walletAddBancomatStart } from "../actions";

const addedPansReducer = (
  state: ReadonlyArray<WalletV2> = [],
  action: Action
): ReadonlyArray<WalletV2> => {
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

export default addedPansReducer;
