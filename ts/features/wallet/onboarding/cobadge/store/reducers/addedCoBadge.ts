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
import { addCoBadgeToWallet, walletAddCoBadgeStart } from "../actions";

const addedCoBadgeReducer = (
  state: ReadonlyArray<RawCreditCardPaymentMethod> = [],
  action: Action
): ReadonlyArray<RawCreditCardPaymentMethod> => {
  switch (action.type) {
    // Register a new Cobadge added in the current onboarding session
    case getType(addCoBadgeToWallet.success):
      return [...state, action.payload];
    // Reset the state when starting a new Cobadge onboarding workflow
    case getType(walletAddCoBadgeStart):
      return [];
  }
  return state;
};

export const onboardingCoBadgeAddedSelector = createSelector(
  [state => state.wallet.onboarding.coBadge.addedCoBadge, abiSelector],
  (addedCoBadge, remoteAbi): ReadonlyArray<CreditCardPaymentMethod> =>
    addedCoBadge.map(p => enhanceCreditCard(p, getValueOrElse(remoteAbi, {})))
);

export default addedCoBadgeReducer;
