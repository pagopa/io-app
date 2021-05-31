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
import { euCovidCertificateGet } from "../actions";

type EuCovidCertByIdState = IndexedById<
  pot.Pot<EUCovidCertificateResponse, Error>
>;

export const euCovidCertByIdReducer = (
  state: EuCovidCertByIdState = {},
  action: Action
): EuCovidCertByIdState => {
  console.log(action.type);
  switch (action.type) {
    case getType(euCovidCertificateGet.request):
      return toLoading(action.payload, state);
    case getType(euCovidCertificateGet.success):
      console.log(action.payload);
      return toSome(action.payload.authCode, state, action.payload);
    case getType(euCovidCertificateGet.failure):
      return toError(action.payload.authCode, state, action.payload.value);
  }

  return state;
};
