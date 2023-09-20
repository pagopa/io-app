import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { IDPayClient } from "../../common/api/client";
import { idpayInitiativePaymentMethodsGet } from "../store/actions";
import { handleGetInitiativePaymentMethods } from "./handleGetInitiativePaymentMethods";

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
    idpayInitiativePaymentMethodsGet.request,
    handleGetInitiativePaymentMethods,
    idPayClient.getInstrumentList,
    bearerToken,
    preferredLanguage
  );
}
