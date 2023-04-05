import { SagaIterator } from "redux-saga";
import {
  call,
  race,
  take,
  takeEvery,
  takeLatest
} from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { waitBackoffError } from "../../../../utils/backoffError";
import { IDPayClient } from "../../common/api/client";
import {
  IdPayInitiativesFromInstrumentPayloadType,
  IdpayInitiativesInstrumentDeletePayloadType,
  IdpayInitiativesInstrumentEnrollPayloadType,
  idPayInitiativesFromInstrumentGet,
  idPayWalletGet,
  idpayInitiativesInstrumentDelete,
  idpayInitiativesInstrumentEnroll,
  idpayInitiativesFromInstrumentRefreshEnd,
  idpayInitiativesFromInstrumentRefreshStart
} from "../store/actions";
import {
  handleGetIDPayInitiativesFromInstrument,
  initiativesFromInstrumentRefresh
} from "./handleGetIDPayInitiativesFromInstrument";
import { handleGetIDPayWallet } from "./handleGetIDPayWallet";
import {
  handleInitiativeInstrumentDelete,
  handleInitiativeInstrumentEnrollment
} from "./handleInitiativeInstrumentEnrollment";

/**
 * Handle the IDPay Wallet requests
 * @param bearerToken
 */
export function* watchIDPayWalletSaga(
  idPayClient: IDPayClient,
  token: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  // handle the request of getting id pay wallet
  yield* takeLatest(idPayWalletGet.request, function* () {
    // wait backoff time if there were previous errors
    yield* call(waitBackoffError, idPayWalletGet.failure);
    yield* call(
      handleGetIDPayWallet,
      idPayClient.getWallet,
      token,
      preferredLanguage
    );
  });

  yield* takeLatest(
    idPayInitiativesFromInstrumentGet.request,
    function* (action: { payload: IdPayInitiativesFromInstrumentPayloadType }) {
      // wait backoff time if there were previous errors
      yield* call(waitBackoffError, idPayInitiativesFromInstrumentGet.failure);
      yield* call(
        handleGetIDPayInitiativesFromInstrument,
        idPayClient.getInitiativesWithInstrument,
        token,
        preferredLanguage,
        action.payload
      );
    }
  );
  yield* takeEvery(
    idpayInitiativesInstrumentEnroll.request,
    function* (action: {
      payload: IdpayInitiativesInstrumentEnrollPayloadType;
    }) {
      // wait backoff time if there were previous errors
      yield* call(waitBackoffError, idpayInitiativesInstrumentEnroll.failure);
      yield* call(
        handleInitiativeInstrumentEnrollment,
        idPayClient.enrollInstrument,
        token,
        preferredLanguage,
        action.payload
      );
    }
  );
  yield* takeEvery(
    idpayInitiativesInstrumentDelete.request,
    function* (action: {
      payload: IdpayInitiativesInstrumentDeletePayloadType;
    }) {
      // wait backoff time if there were previous errors
      yield* call(waitBackoffError, idpayInitiativesInstrumentEnroll.failure);
      yield* call(
        handleInitiativeInstrumentDelete,
        idPayClient.deleteInstrument,
        token,
        preferredLanguage,
        action.payload
      );
    }
  );
  yield* takeEvery(
    idpayInitiativesFromInstrumentRefreshStart,
    function* (action: { payload: IdPayInitiativesFromInstrumentPayloadType }) {
      yield* race({
        task: call(
          initiativesFromInstrumentRefresh,
          action.payload.idWallet,
          action.payload.isRefreshCall
        ),
        cancel: take(idpayInitiativesFromInstrumentRefreshEnd.type)
      });
    }
  );
}
