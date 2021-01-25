import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  RawSatispayPaymentMethod,
  SatispayPaymentMethod
} from "../../../../../../types/pagopa";
import { enhanceSatispay } from "../../../../../../utils/paymentMethod";
import { addSatispayToWallet, walletAddSatispayStart } from "../actions";

// TODO: can remove this and using only addingSatispay??
export const addedSatispayReducer = (
  state: RawSatispayPaymentMethod | null = null,
  action: Action
): RawSatispayPaymentMethod | null => {
  switch (action.type) {
    // Register a Satispay account added in the current onboarding session
    case getType(addSatispayToWallet.success):
      return action.payload;
    // Reset the state when starting a new satispay onboarding
    case getType(walletAddSatispayStart):
      return null;
  }
  return state;
};

/**
 * Return the added satispay account during the latest addition
 * @param state
 */
export const onboardingSatispayAddedResultSelector = (
  state: GlobalState
): SatispayPaymentMethod | undefined => {
  const addedSatispay = state.wallet.onboarding.satispay.addedSatispay;

  return addedSatispay !== null ? enhanceSatispay(addedSatispay) : undefined;
};
