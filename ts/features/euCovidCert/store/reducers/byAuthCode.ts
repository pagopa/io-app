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

/**
 * Store the EU Certificate response status based on the AuthCode used to issue the request
 * @param state
 * @param action
 */
export const euCovidCertByAuthCodeReducer = (
  state: EuCovidCertByIdState = {},
  action: Action
): EuCovidCertByIdState => {
  switch (action.type) {
    case getType(euCovidCertificateGet.request):
      return toLoading(action.payload, state);
    case getType(euCovidCertificateGet.success):
      return toSome(action.payload.authCode, state, action.payload);
    case getType(euCovidCertificateGet.failure):
      return toError(action.payload.authCode, state, action.payload.value);
  }

  return state;
};
