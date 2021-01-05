import { Action, combineReducers } from "redux";
import { RawBPayPaymentMethod } from "../../../../../../types/pagopa";
import abiSelectedReducer, { AbiSelected } from "./abiSelected";
import addedBPayReducer from "./addedBPay";
import addingBPayReducer, { AddingBPayState } from "./addingBPay";
import foundBpayReducer, { RemoteBPay } from "./foundBpay";

export type OnboardingBPayState = {
  foundBPay: RemoteBPay;
  addingBPay: AddingBPayState;
  addedBPay: ReadonlyArray<RawBPayPaymentMethod>;
  abiSelected: AbiSelected;
};

const onboardingBPayReducer = combineReducers<OnboardingBPayState, Action>({
  // the BPay account found for the user during the onboarding phase
  foundBPay: foundBpayReducer,
  // the BPay account that user is adding to his wallet
  addingBPay: addingBPayReducer,
  // the BPay account that user added to his wallet (during the last BPay onboarding workflow)
  addedBPay: addedBPayReducer,
  // the bank (abi) chosen by the user during the onboarding phase. Can be null (the user skip the bank selection)
  abiSelected: abiSelectedReducer
});

export default onboardingBPayReducer;
