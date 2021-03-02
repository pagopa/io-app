import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import {
  CreditCardPaymentMethod,
  RawCreditCardPaymentMethod
} from "../../../../../../types/pagopa";
import { enhanceCreditCard } from "../../../../../../utils/paymentMethod";
import { getValueOrElse } from "../../../../../bonus/bpd/model/RemoteValue";
import { abiSelector } from "../../../store/abi";
import { addPrivativeToWallet, walletAddPrivativeStart } from "../actions";

const addedPrivativeReducer = (
  state: ReadonlyArray<RawCreditCardPaymentMethod> = [],
  action: Action
): ReadonlyArray<RawCreditCardPaymentMethod> => {
  switch (action.type) {
    // Register a new privative card added in the current onboarding session
    case getType(addPrivativeToWallet.success):
      return [...state, action.payload];
    // Reset the state when starting a new privative onboarding workflow
    case getType(walletAddPrivativeStart):
      return [];
  }
  return state;
};

// TODO: replace enhanceCreditCard with enhancePrivative to add the brand logo!
export const onboardingPrivativeAddedSelector = createSelector(
  [state => state.wallet.onboarding.privative.addedPrivative, abiSelector],
  (addedCoBadge, remoteAbi): ReadonlyArray<CreditCardPaymentMethod> =>
    addedCoBadge.map(p => enhanceCreditCard(p, getValueOrElse(remoteAbi, {})))
);

export default addedPrivativeReducer;
