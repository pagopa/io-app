import { SagaIterator, channel } from "redux-saga";
import {
  call,
  put,
  race,
  take,
  takeEvery,
  takeLatest
} from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { IDPayClient } from "../../common/api/client";
import {
  IdPayInitiativesFromInstrumentPayloadType,
  idPayInitiativesFromInstrumentGet,
  idPayInitiativesFromInstrumentRefreshStart,
  idPayInitiativesFromInstrumentRefreshStop,
  idPayWalletGet,
  idpayInitiativesInstrumentDelete,
  idpayInitiativesInstrumentEnroll
} from "../store/actions";
import {
  handleGetIDPayInitiativesFromInstrument,
  handleInitiativesFromInstrumentRefresh
} from "./handleGetInitiativesFromInstrument";
import { handleGetIDPayWallet } from "./handleGetWallet";
import { handleInitiativeInstrumentDelete } from "./handleInitiativeInstrumentDelete";
import { handleInitiativeInstrumentEnrollment } from "./handleInitiativeInstrumentEnrollment";

/**
 * Handle the IDPay Wallet requests
 * @param bearerToken
 */
export function* watchIDPayWalletSaga(
  idPayClient: IDPayClient,
  bearerAuth: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  yield* takeLatest(
    idPayWalletGet.request,
    handleGetIDPayWallet,
    idPayClient.getWallet,
    bearerAuth,
    preferredLanguage
  );

  yield* takeLatest(
    idPayInitiativesFromInstrumentGet.request,
    handleGetIDPayInitiativesFromInstrument,
    idPayClient.getInitiativesWithInstrument,
    bearerAuth,
    preferredLanguage
  );

  yield* takeEvery(
    idpayInitiativesInstrumentEnroll.request,
    handleInitiativeInstrumentEnrollment,
    idPayClient.enrollInstrument,
    bearerAuth,
    preferredLanguage
  );

  yield* takeEvery(
    idpayInitiativesInstrumentDelete.request,
    handleInitiativeInstrumentDelete,
    idPayClient.deleteInstrument,
    bearerAuth,
    preferredLanguage
  );

  const instrumentRefreshChannel = yield* call(channel);

  yield* takeEvery(
    idPayInitiativesFromInstrumentRefreshStart,
    function* (action: { payload: IdPayInitiativesFromInstrumentPayloadType }) {
      yield* race({
        task: call(
          handleInitiativesFromInstrumentRefresh,
          action.payload.idWallet
        ),
        cancel: take(instrumentRefreshChannel)
      });
    }
  );

  yield* takeEvery(idPayInitiativesFromInstrumentRefreshStop, function* () {
    yield* put(instrumentRefreshChannel, "kill");
  });
}
