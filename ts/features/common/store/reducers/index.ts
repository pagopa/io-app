import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import {
  euCovidCertReducer,
  EuCovidCertState
} from "../../../euCovidCert/store/reducers";
import { mvlReducer, MvlState } from "../../../mvl/store/reducers";

export type FeaturesState = {
  euCovidCert: EuCovidCertState;
  mvl: MvlState;
};

export const featuresReducer = combineReducers<FeaturesState, Action>({
  euCovidCert: euCovidCertReducer,
  mvl: mvlReducer
});
