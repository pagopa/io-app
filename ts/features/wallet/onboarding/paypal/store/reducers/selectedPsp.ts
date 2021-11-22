import { getType } from "typesafe-actions";
import { IOPayPalPsp } from "../../types";
import { Action } from "../../../../../../store/actions/types";
import { walletAddPaypalPspSelected, walletAddPaypalStart } from "../actions";

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

export default selectedPspReducer;
