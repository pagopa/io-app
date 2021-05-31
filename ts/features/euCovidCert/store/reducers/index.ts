import { pot } from "italia-ts-commons";
import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import { EUCovidCertificateResponse } from "../../types/EUCovidCertificateResponse";
import { euCovidCertByIdReducer } from "./byId";

export type EuCovidCertState = {
  byId: IndexedById<pot.Pot<EUCovidCertificateResponse, Error>>;
};

export const euCovidCertReducer = combineReducers<EuCovidCertState, Action>({
  byId: euCovidCertByIdReducer
});
