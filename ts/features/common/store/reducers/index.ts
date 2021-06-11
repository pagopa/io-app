import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import {
  euCovidCertReducer,
  EuCovidCertState
} from "../../../euCovidCert/store/reducers";

export type FeaturesState = {
  euCovidCert: EuCovidCertState;
};

export const featuresReducer = combineReducers<FeaturesState, Action>({
  euCovidCert: euCovidCertReducer
});
