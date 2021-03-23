import { Action, combineReducers } from "redux";
import { RawBancomatPaymentMethod } from "../../../../../../types/pagopa";
import abiSelectedReducer, { AbiSelected } from "./abiSelected";
import addedPansReducer from "./addedPans";
import addingPansReducer, { AddingPansState } from "./addingPans";
import pansReducer, { Pans } from "./pans";

export type OnboardingBancomatState = {
  foundPans: Pans;
  addingPans: AddingPansState;
  addedPans: ReadonlyArray<RawBancomatPaymentMethod>;
  abiSelected: AbiSelected;
};

const onboardingBancomatReducer = combineReducers<
  OnboardingBancomatState,
  Action
>({
  // the bancomat pans found for the user during the onboarding phase of a new bancomat
  foundPans: pansReducer,
  // the bancomat pan that user is adding to his wallet
  addingPans: addingPansReducer,
  // the bancomat pan that user add to his wallet (during the last bancomat onboarding workflow)
  addedPans: addedPansReducer,
  // the bank (abi) chosen by the user during the onboarding phase. Can be null (the user skip the bank selection)
  abiSelected: abiSelectedReducer
});

export default onboardingBancomatReducer;
