import { SagaIterator, channel } from "redux-saga";
import {
  takeLatest,
  takeEvery,
  call,
  race,
  take,
  put
} from "typed-redux-saga/macro";
import { IDPayClient } from "../../common/api/client";
import {
  IdPayInitiativeInstrumentsGetPayloadType,
  idPayInitiativeInstrumentsRefreshStart,
  idPayInitiativeInstrumentsRefreshStop,
  idpayInitiativeInstrumentDelete,
  idpayInitiativeInstrumentsGet
} from "../store/actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";
import {
  handleGetInitiativeInstruments,
  handleInitiativeInstrumentsRefresh
} from "./handleGetInitiativeInstruments";
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
