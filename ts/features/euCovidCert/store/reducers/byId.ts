import { pot } from "italia-ts-commons";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import {
  toError,
  toLoading,
  toSome
} from "../../../../store/reducers/IndexedByIdPot";
import { EUCovidCertificateResponse } from "../../types/EUCovidCertificateResponse";
import { EuCovidCertificateGet } from "../actions";

type EuCovidCertByIdState = IndexedById<
  pot.Pot<EUCovidCertificateResponse, Error>
>;

export const euCovidCertByIdReducer = (
  state: EuCovidCertByIdState = {},
  action: Action
): EuCovidCertByIdState => {
  switch (action.type) {
    case getType(EuCovidCertificateGet.request):
      return toLoading(action.payload, state);
    case getType(EuCovidCertificateGet.success):
      return toSome(action.payload.authCode, state, action.payload);
    case getType(EuCovidCertificateGet.failure):
      return toError(action.payload.authCode, state, action.payload.value);
  }

  return state;
};
