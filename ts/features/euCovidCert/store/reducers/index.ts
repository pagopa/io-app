import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import { EUCovidCertificateResponse } from "../../types/EUCovidCertificateResponse";
import { euCovidCertByAuthCodeReducer } from "./byAuthCode";
import { currentReducer, EuCovidCertCurrentSelectedState } from "./current";

export type EuCovidCertState = {
  byAuthCode: IndexedById<pot.Pot<EUCovidCertificateResponse, Error>>;
  current: EuCovidCertCurrentSelectedState | null;
};

export const euCovidCertReducer = combineReducers<EuCovidCertState, Action>({
  // save, using the AuthCode as key the the pot.Pot<EUCovidCertificateResponse, Error> response
  byAuthCode: euCovidCertByAuthCodeReducer,
  // The auth code and messageId that the user is viewing
  current: currentReducer
});
