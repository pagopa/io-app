import { combineReducers } from "redux";
import { Action } from "../../../../../../store/actions/types";
import { RawSatispayPaymentMethod } from "../../../../../../types/pagopa";
import { RemoteValue } from "../../../../../bonus/bpd/model/RemoteValue";
import { addedSatispayReducer } from "./addedSatispay";
import { addingSatispayReducer } from "./addingSatispay";
import { foundSatispayReducer, RemoteSatispay } from "./foundSatispay";

export type OnboardSatispayState = {
  // A RemoteValue that represent the found satispay account for the user
  foundSatispay: RemoteSatispay;
  addingSatispay: RemoteValue<RawSatispayPaymentMethod, Error>;
  addedSatispay: RawSatispayPaymentMethod | null;
};

const onboardingSatispayReducer = combineReducers<OnboardSatispayState, Action>(
  {
    // the satispay account found for the user during the onboarding phase
    foundSatispay: foundSatispayReducer,
    // the user is trying to add the satispay account to the wallet
    addingSatispay: addingSatispayReducer,
    // the satispay account that the user choose to add to the wallet
    addedSatispay: addedSatispayReducer
  }
);

export default onboardingSatispayReducer;
