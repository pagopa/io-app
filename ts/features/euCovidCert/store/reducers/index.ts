import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import {
  euCovidCertByAuthCodeReducer,
  EuCovidCertByIdState
} from "./byAuthCode";

export type EuCovidCertState = {
  byAuthCode: EuCovidCertByIdState;
};

export const euCovidCertReducer = combineReducers<EuCovidCertState, Action>({
  // save, using the AuthCode as key the the pot.Pot<EUCovidCertificateResponse, Error> response
  byAuthCode: euCovidCertByAuthCodeReducer
});
