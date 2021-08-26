import { Action, combineReducers } from "redux";
import { RawPrivativePaymentMethod } from "../../../../../../types/pagopa";
import addedPrivativeReducer from "./addedPrivative";
import addingPrivativeReducer, {
  AddingPrivativeState
} from "./addingPrivative";
import foundPrivativeReducer, { RemotePrivative } from "./foundPrivative";
import privativeIssuersReducer, {
  PrivativeIssuersState
} from "./privativeIssuers";

import searchedPrivativeReducer, {
  SearchedPrivativeData
} from "./searchedPrivative";
import searchPrivativeRequestIdReducer, {
  SearchPrivativeRequestIdState
} from "./searchPrivativeRequestId";

export type OnboardingPrivativeState = {
  foundPrivative: RemotePrivative;
  addingPrivative: AddingPrivativeState;
  addedPrivative: RawPrivativePaymentMethod | null;
  searchedPrivative: SearchedPrivativeData;
  privativeIssuers: PrivativeIssuersState;
  searchPrivativeRequestId: SearchPrivativeRequestIdState;
};

const onboardingPrivativeReducer = combineReducers<
  OnboardingPrivativeState,
  Action
>({
  // The privative card found for the user during the onboarding phase
  foundPrivative: foundPrivativeReducer,
  // The privative card that user is adding to his wallet
  addingPrivative: addingPrivativeReducer,
  // The privative that user added to his wallet (during the last privative onboarding workflow)
  addedPrivative: addedPrivativeReducer,
  // The card information (brand, card number) searched
  searchedPrivative: searchedPrivativeReducer,
  // A list of brand for which it is allowed to use the privative search service
  privativeIssuers: privativeIssuersReducer,
  // the search id used to follow up the privative search
  searchPrivativeRequestId: searchPrivativeRequestIdReducer
});

export default onboardingPrivativeReducer;
