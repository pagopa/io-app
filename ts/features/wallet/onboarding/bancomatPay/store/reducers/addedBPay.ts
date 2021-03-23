import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import {
  BPayPaymentMethod,
  RawBPayPaymentMethod
} from "../../../../../../types/pagopa";
import { enhanceBPay } from "../../../../../../utils/paymentMethod";
import { getValueOrElse } from "../../../../../bonus/bpd/model/RemoteValue";
import { abiSelector } from "../../../store/abi";
import { addBPayToWallet, walletAddBPayStart } from "../actions";

const addedBPayReducer = (
  state: ReadonlyArray<RawBPayPaymentMethod> = [],
  action: Action
): ReadonlyArray<RawBPayPaymentMethod> => {
  switch (action.type) {
    // Register a new BPay account added in the current onboarding session
    case getType(addBPayToWallet.success):
      return [...state, action.payload];
    // Reset the state when starting a new BPay onboarding workflow
    case getType(walletAddBPayStart):
      return [];
  }
  return state;
};

export const onboardingBPayAddedAccountSelector = createSelector(
  [state => state.wallet.onboarding.bPay.addedBPay, abiSelector],
  (addedPans, remoteAbi): ReadonlyArray<BPayPaymentMethod> =>
    addedPans.map(p => enhanceBPay(p, getValueOrElse(remoteAbi, {})))
);

export default addedBPayReducer;
