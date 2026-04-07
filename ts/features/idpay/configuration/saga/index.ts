import { channel, SagaIterator } from "redux-saga";
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
  idpayInitiativeInstrumentDelete,
  idpayInitiativeInstrumentsGet,
  IdPayInitiativeInstrumentsGetPayloadType,
  idPayInitiativeInstrumentsRefreshStart,
  idPayInitiativeInstrumentsRefreshStop
} from "../store/actions";
import { handleDeleteInitiativeInstruments } from "./handleDeleteInitiativeInstrument";
import {
  handleGetInitiativeInstruments,
  handleInitiativeInstrumentsRefresh
} from "./handleGetInitiativeInstruments";

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

  const instrumentRefreshChannel = yield* call(channel);

  yield* takeEvery(
    idPayInitiativeInstrumentsRefreshStart,
    function* (action: { payload: IdPayInitiativeInstrumentsGetPayloadType }) {
      yield* race({
        task: call(
          handleInitiativeInstrumentsRefresh,
          action.payload.initiativeId
        ),
        cancel: take(instrumentRefreshChannel)
      });
    }
  );

  yield* takeEvery(idPayInitiativeInstrumentsRefreshStop, function* () {
    yield* put(instrumentRefreshChannel, "kill");
  });
}
