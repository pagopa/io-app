import { pot } from "italia-ts-commons";
import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import { EUCovidCertificateResponse } from "../../types/EUCovidCertificateResponse";
import { euCovidCertByAuthCodeReducer } from "./byAuthCode";

export type EuCovidCertState = {
  byAuthCode: IndexedById<pot.Pot<EUCovidCertificateResponse, Error>>;
};

export const euCovidCertReducer = combineReducers<EuCovidCertState, Action>({
  // save, using the AuthCode as key the the pot.Pot<EUCovidCertificateResponse, Error> response
  byAuthCode: euCovidCertByAuthCodeReducer
});
