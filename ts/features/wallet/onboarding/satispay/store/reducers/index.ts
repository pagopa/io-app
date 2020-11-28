import { combineReducers } from "redux";
import { Action } from "../../../../../../store/actions/types";
import { RawSatispayPaymentMethod } from "../../../../../../types/pagopa";
import { addedSatispayReducer } from "./addedSatispay";
import { foundSatispayReducer, RemoteSatispay } from "./foundSatispay";

export type OnboardSatispayState = {
  // A RemoteValue that represent the found satispay account for the user
  foundSatispay: RemoteSatispay;
  addedSatispay: RawSatispayPaymentMethod | null;
};

const onboardingSatispayReducer = combineReducers<OnboardSatispayState, Action>(
  {
    // the satispay account found for the user during the onboarding phase
    foundSatispay: foundSatispayReducer,
    addedSatispay: addedSatispayReducer
  }
);

export default onboardingSatispayReducer;
