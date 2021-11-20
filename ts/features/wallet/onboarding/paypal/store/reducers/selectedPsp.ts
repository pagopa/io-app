import { getType } from "typesafe-actions";
import { IOPayPalPsp } from "../../types";
import { Action } from "../../../../../../store/actions/types";
import { walletAddPaypalPspSelected, walletAddPaypalStart } from "../actions";
import { GlobalState } from "../../../../../../store/reducers/types";

export type PayPalSelectedPspState = IOPayPalPsp | null;
const initialState = null;

const selectedPspReducer = (
  state: PayPalSelectedPspState = initialState,
  action: Action
): PayPalSelectedPspState => {
  switch (action.type) {
    // reset the state when paypal onboarding flow starts
    case getType(walletAddPaypalStart):
      return initialState;
    case getType(walletAddPaypalPspSelected):
      return action.payload;
    default:
      return state;
  }
};

export const paypalOnboardingSelectedPsp = (
  state: GlobalState
): PayPalSelectedPspState => state.wallet.onboarding.paypal.selectedPsp;

export default selectedPspReducer;
