import { Action, combineReducers } from "redux";
import { RawCreditCardPaymentMethod } from "../../../../../../types/pagopa";
import abiConfigurationReducer, {
  AbiConfigurationState
} from "./abiConfiguration";
import abiSelectedReducer, { AbiSelected } from "./abiSelected";
import addedCoBadgeReducer from "./addedCoBadge";
import addingCoBadgeReducer, { AddingCoBadgeState } from "./addingCoBadge";
import addingPrivativeReducer, {
  AddingPrivativeState
} from "./addingPrivative";
import foundPrivativeReducer, { RemotePrivative } from "./foundPrivative";
import searchRequestIdReducer, {
  SearchCoBadgeRequestIdState
} from "./searchCoBadgeRequestId";

export type OnboardingPrivativeState = {
  foundPrivative: RemotePrivative;
  addingPrivative: AddingPrivativeState;
  addedPrivative: ReadonlyArray<RawCreditCardPaymentMethod>;
  brandSelected: AbiSelected;
  brandConfiguration: AbiConfigurationState;
  searchPrivativeRequestId: SearchCoBadgeRequestIdState;
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
  addedPrivative: addedCoBadgeReducer,
  // The brand chosen by the user during the onboarding phase.
  brandSelected: abiSelectedReducer,
  // A list of brand for which it is allowed to use the privative search service
  brandConfiguration: abiConfigurationReducer,
  // the search id used to follow up the privative search
  searchPrivativeRequestId: searchRequestIdReducer
});

export default onboardingPrivativeReducer;
