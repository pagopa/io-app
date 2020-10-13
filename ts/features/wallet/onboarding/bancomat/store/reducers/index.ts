import { Action, combineReducers } from "redux";
import pansReducer, { Pans } from "./pans";
import abiSelectedReducer, { AbiSelected } from "./abiSelected";

export type BancomatState = {
  foundPans: Pans;
  abiSelected: AbiSelected;
};

const bancomatReducer = combineReducers<BancomatState, Action>({
  // the bancomat pans found for the user during the onboarding phase of a new bancomat
  foundPans: pansReducer,
  // the bank (abi) chosen by the user during the onboarding phase. Can be null (the user skip the bank selection)
  abiSelected: abiSelectedReducer
});

export default bancomatReducer;
