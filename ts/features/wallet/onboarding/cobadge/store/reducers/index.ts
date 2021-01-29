import { Action, combineReducers } from "redux";
import { RawCreditCardPaymentMethod } from "../../../../../../types/pagopa";
import abiConfigurationReducer, {
  AbiConfigurationState
} from "./abiConfiguration";
import abiSelectedReducer, { AbiSelected } from "./abiSelected";
import addedCoBadgeReducer from "./addedCoBadge";
import addingCoBadgeReducer, { AddingCoBadgeState } from "./addingCoBadge";
import foundCoBadgeReducer, { RemoteCoBadge } from "./foundCoBadge";
import searchRequestIdReducer, {
  SearchCoBadgeRequestIdState
} from "./searchCoBadgeRequestId";

export type OnboardingCoBadgeState = {
  foundCoBadge: RemoteCoBadge;
  addingCoBadge: AddingCoBadgeState;
  addedCoBadge: ReadonlyArray<RawCreditCardPaymentMethod>;
  abiSelected: AbiSelected;
  abiConfiguration: AbiConfigurationState;
  searchCoBadgeRequestId: SearchCoBadgeRequestIdState;
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
  abiSelected: abiSelectedReducer,
  // A list of abi for which it is allowed to use the co-badge search service
  abiConfiguration: abiConfigurationReducer,
  // the search id used to follow up the cobadge search
  searchCoBadgeRequestId: searchRequestIdReducer
});

export default onboardingCoBadgeReducer;
