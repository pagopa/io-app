import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import {
  PrivativePaymentMethod,
  RawPrivativePaymentMethod
} from "../../../../../../types/pagopa";
import { enhancePrivativeCard } from "../../../../../../utils/paymentMethod";
import { getValueOrElse } from "../../../../../bonus/bpd/model/RemoteValue";
import { abiSelector } from "../../../store/abi";
import { addPrivativeToWallet, walletAddPrivativeStart } from "../actions";

const addedPrivativeReducer = (
  state: RawPrivativePaymentMethod | null = null,
  action: Action
): RawPrivativePaymentMethod | null => {
  switch (action.type) {
    // Register a new privative card added in the current onboarding session
    case getType(addPrivativeToWallet.success):
      return action.payload;
    // Reset the state when starting a new privative onboarding workflow
    case getType(walletAddPrivativeStart):
      return null;
  }
  return state;
};

export const onboardingPrivativeAddedSelector = createSelector(
  [state => state.wallet.onboarding.privative.addedPrivative, abiSelector],
  (addedPrivative, remoteAbi): PrivativePaymentMethod | undefined =>
    addedPrivative
      ? enhancePrivativeCard(addedPrivative, getValueOrElse(remoteAbi, {}))
      : undefined
);

export default addedPrivativeReducer;
