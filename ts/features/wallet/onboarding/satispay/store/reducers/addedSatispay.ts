import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { RawSatispayPaymentMethod } from "../../../../../../types/pagopa";
import { addSatispayToWallet, walletAddSatispayStart } from "../actions";

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
