import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import {
  BancomatPaymentMethod,
  RawBancomatPaymentMethod
} from "../../../../../../types/pagopa";
import { enhanceBancomat } from "../../../../../../utils/paymentMethod";
import { getValueOrElse } from "../../../../../bonus/bpd/model/RemoteValue";
import { abiSelector } from "../../../store/abi";
import { addBancomatToWallet, walletAddBancomatStart } from "../actions";

const addedPansReducer = (
  state: ReadonlyArray<RawBancomatPaymentMethod> = [],
  action: Action
): ReadonlyArray<RawBancomatPaymentMethod> => {
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

export const onboardingBancomatAddedPansSelector = createSelector(
  [state => state.wallet.onboarding.bancomat.addedPans, abiSelector],
  (addedPans, remoteAbi): ReadonlyArray<BancomatPaymentMethod> =>
    addedPans.map(p => enhanceBancomat(p, getValueOrElse(remoteAbi, {})))
);

export default addedPansReducer;
