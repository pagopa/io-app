import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { IDPayClient } from "../../common/api/client";
import {
  idpayInitiativeInstrumentDelete,
  idpayInitiativeInstrumentsGet
} from "../store/actions";
import { handleGetInitiativeInstruments } from "./handleGetInitiativeInstruments";
import { handleDeleteInitiativeInstruments } from "./handleDeleteInitiativeInstrument";

/**
 * Handle IDPAY initiative requests
 * @param idPayClient
 * @param bpdToken
 * @param preferredLanguage
 */
export function* watchIDPayInitiativeConfigurationSaga(
  idPayClient: IDPayClient,
  bearerToken: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  yield* takeLatest(
    idpayInitiativeInstrumentsGet.request,
    handleGetInitiativeInstruments,
    idPayClient.getInstrumentList,
    bearerToken,
    preferredLanguage
  );

  yield* takeLatest(
    idpayInitiativeInstrumentDelete.request,
    handleDeleteInitiativeInstruments,
    idPayClient.deleteInstrument,
    bearerToken,
    preferredLanguage
  );
}
