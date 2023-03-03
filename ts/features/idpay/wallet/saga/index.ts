import { SagaIterator } from "redux-saga";
import { call, takeLatest, takeEvery, select } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createIDPayWalletClient } from "../api/client";
import {
  idPayTestToken,
  idPayApiUatBaseUrl,
  idPayApiBaseUrl
} from "../../../../config";
import {
  IdpayInitiativesPairingPayloadType,
  IdpayInitiativesUnpairPayloadType,
  IdpayWalletInitiativeGetPayloadType,
  idPayWalletGet,
  idPayWalletInitiativesGet,
  idpayInitiativesPairingDelete,
  idpayInitiativesPairingPut
} from "../store/actions";
import { waitBackoffError } from "../../../../utils/backoffError";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "../../../../store/reducers/persistedPreferences";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { fromLocaleToPreferredLanguage } from "../../../../utils/locale";
import { handleGetIDPayWallet } from "./handleGetIDPayWallet";
import { handleGetIDPayInitiativesWithInstrument } from "./handleGetIdpayInitiativesWithInstrument";
import { handleInitiativePairing } from "./handleInitiativePairing";

/**
 * Handle the IDPay Wallet requests
 * @param bearerToken
 */
export function* watchIDPayWalletSaga(bearerToken: string): SagaIterator {
  const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);
  const baseUrl = isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl;
  const token = idPayTestToken ?? bearerToken;

  const idPayWalletClient = createIDPayWalletClient(baseUrl);
  const language = yield* select(preferredLanguageSelector);

  const preferredLanguage = pipe(
    language,
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  // handle the request of getting id pay wallet
  yield* takeLatest(idPayWalletGet.request, function* () {
    // wait backoff time if there were previous errors
    yield* call(waitBackoffError, idPayWalletGet.failure);
    yield* call(
      handleGetIDPayWallet,
      idPayWalletClient.getWallet,
      token,
      preferredLanguage
    );
  });

  yield* takeLatest(
    idPayWalletInitiativesGet.request,
    function* (action: { payload: IdpayWalletInitiativeGetPayloadType }) {
      // wait backoff time if there were previous errors
      yield* call(waitBackoffError, idPayWalletInitiativesGet.failure);
      yield* call(
        handleGetIDPayInitiativesWithInstrument,
        idPayWalletClient.getInitiativesWithInstrument,
        token,
        preferredLanguage,
        action.payload
      );
    }
  );
  yield* takeEvery(
    idpayInitiativesPairingPut.request,
    function* (action: { payload: IdpayInitiativesPairingPayloadType }) {
      // wait backoff time if there were previous errors
      yield* call(waitBackoffError, idpayInitiativesPairingPut.failure);
      yield* call(
        handleInitiativePairing,
        idPayWalletClient.enrollInstrument,
        token,
        preferredLanguage,
        idpayInitiativesPairingPut,
        action.payload
      );
    }
  );
  yield *
    takeEvery(
      idpayInitiativesPairingDelete.request,
      function* (action: { payload: IdpayInitiativesUnpairPayloadType }) {
        // wait backoff time if there were previous errors
        yield* call(waitBackoffError, idpayInitiativesPairingPut.failure);
        yield* call(
          handleInitiativePairing,
          idPayWalletClient.deleteInstrument,
          token,
          preferredLanguage,
          idpayInitiativesPairingDelete,
          action.payload,

        );
      }
    );
}
