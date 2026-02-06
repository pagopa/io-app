import { SagaIterator, channel } from "redux-saga";
import {
  call,
  put,
  race,
  take,
  takeEvery,
  takeLatest
} from "typed-redux-saga/macro";
import { IDPayClient } from "../../common/api/client";
import {
  IdPayInitiativesFromInstrumentPayloadType,
  idPayInitiativeWaitingListGet,
  idPayInitiativesFromInstrumentGet,
  idPayInitiativesFromInstrumentRefreshStart,
  idPayInitiativesFromInstrumentRefreshStop,
  idPayWalletGet,
  idpayInitiativesInstrumentDelete,
  idpayInitiativesInstrumentEnroll
} from "../store/actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";
import {
  handleGetIDPayInitiativesFromInstrument,
  handleInitiativesFromInstrumentRefresh
} from "./handleGetInitiativesFromInstrument";
import { handleGetIDPayWallet } from "./handleGetWallet";
import { handleInitiativeInstrumentDelete } from "./handleInitiativeInstrumentDelete";
import { handleInitiativeInstrumentEnrollment } from "./handleInitiativeInstrumentEnrollment";
import { handleGetInitiativeWaitingList } from "./handleGetInitiativeWaitingList";

/**
 * Handle the IDPay Wallet requests
 * @param bearerToken
 */
export function* watchIDPayWalletSaga(
  idPayClient: IDPayClient,
  bearerToken: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  yield* takeLatest(
    idPayWalletGet.request,
    handleGetIDPayWallet,
    idPayClient.getWallet,
    bearerToken,
    preferredLanguage
  );

  yield* takeLatest(
    idPayInitiativesFromInstrumentGet.request,
    handleGetIDPayInitiativesFromInstrument,
    idPayClient.getInitiativesWithInstrument,
    bearerToken,
    preferredLanguage
  );

  yield* takeEvery(
    idpayInitiativesInstrumentEnroll.request,
    handleInitiativeInstrumentEnrollment,
    idPayClient.enrollInstrument,
    bearerToken,
    preferredLanguage
  );

  yield* takeEvery(
    idpayInitiativesInstrumentDelete.request,
    handleInitiativeInstrumentDelete,
    idPayClient.deleteInstrument,
    bearerToken,
    preferredLanguage
  );

  yield* takeEvery(
    idPayInitiativeWaitingListGet.request,
    handleGetInitiativeWaitingList,
    idPayClient.onboardingInitiativeUserStatus,
    bearerToken,
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
