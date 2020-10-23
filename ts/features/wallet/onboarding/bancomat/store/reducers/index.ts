import { Action, combineReducers } from "redux";
import { WalletV2 } from "../../../../../../../definitions/pagopa/bancomat/WalletV2";
import addedPansReducer from "./addedPans";
import pansReducer, { Pans } from "./pans";
import abiSelectedReducer, { AbiSelected } from "./abiSelected";
import addingPansReducer, { AddingPansState } from "./addingPans";

export type BancomatState = {
  foundPans: Pans;
  addingPans: AddingPansState;
  addedPans: ReadonlyArray<WalletV2>;
  abiSelected: AbiSelected;
};

const bancomatReducer = combineReducers<BancomatState, Action>({
  // the bancomat pans found for the user during the onboarding phase of a new bancomat
  foundPans: pansReducer,
  // the bancomat pan that user is adding to his wallet
  addingPans: addingPansReducer,
  // the bancomat pan that user add to his wallet (during the last bancomat onboarding workflow)
  addedPans: addedPansReducer,
  // the bank (abi) chosen by the user during the onboarding phase. Can be null (the user skip the bank selection)
  abiSelected: abiSelectedReducer
});

export default bancomatReducer;
