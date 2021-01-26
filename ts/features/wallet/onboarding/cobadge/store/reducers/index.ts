import { Action, combineReducers } from "redux";
import { RawCreditCardPaymentMethod } from "../../../../../../types/pagopa";
import abiSelectedReducer, { AbiSelected } from "./abiSelected";
import addedCoBadgeReducer from "./addedCoBadge";
import addingCoBadgeReducer, { AddingCoBadgeState } from "./addingCoBadge";
import foundCoBadgeReducer, { RemoteCoBadge } from "./foundCoBadge";

export type OnboardingCoBadgeState = {
  foundCoBadge: RemoteCoBadge;
  addingCoBadge: AddingCoBadgeState;
  addedCoBadge: ReadonlyArray<RawCreditCardPaymentMethod>;
  abiSelected: AbiSelected;
  // TODO: fields to add
  // allowedAbi: list of abi allowed;
  // requestId: string with request id;
};

const onboardingCoBadgeReducer = combineReducers<
  OnboardingCoBadgeState,
  Action
>({
  // the CoBadge found for the user during the onboarding phase
  foundCoBadge: foundCoBadgeReducer,
  // the CoBadge that user is adding to his wallet
  addingCoBadge: addingCoBadgeReducer,
  // the CoBadge that user added to his wallet (during the last CoBadge onboarding workflow)
  addedCoBadge: addedCoBadgeReducer,
  // the bank (abi) chosen by the user during the onboarding phase. Can be null (the user skip the bank selection)
  abiSelected: abiSelectedReducer
});

export default onboardingCoBadgeReducer;
