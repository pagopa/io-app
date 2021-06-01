import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import { EUCovidCertificateAuthCode } from "../../types/EUCovidCertificate";
import { EUCovidCertificateResponse } from "../../types/EUCovidCertificateResponse";
import { euCovidCertByAuthCodeReducer } from "./byAuthCode";
import { currentAuthCodeReducer } from "./currentAuthCode";

export type EuCovidCertState = {
  byAuthCode: IndexedById<pot.Pot<EUCovidCertificateResponse, Error>>;
  currentAuthCode: EUCovidCertificateAuthCode | null;
};

export const euCovidCertReducer = combineReducers<EuCovidCertState, Action>({
  // save, using the AuthCode as key the the pot.Pot<EUCovidCertificateResponse, Error> response
  byAuthCode: euCovidCertByAuthCodeReducer,
  // The current auth code that the user is viewing
  currentAuthCode: currentAuthCodeReducer
});
