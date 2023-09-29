import { SagaIterator, channel } from "redux-saga";
import {
  takeLatest,
  takeEvery,
  call,
  race,
  take,
  put
} from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { IDPayClient } from "../../common/api/client";
import {
  IdPayInitiativeInstrumentsGetPayloadType,
  idPayInitiativesInstrumentRefreshStart,
  idPayInitiativesInstrumentRefreshStop,
  idpayInitiativeInstrumentDelete,
  idpayInitiativeInstrumentsGet
} from "../store/actions";
import {
  handleGetInitiativeInstruments,
  handleInitiativesFromInstrumentRefresh
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
    idPayInitiativesInstrumentRefreshStart,
    function* (action: { payload: IdPayInitiativeInstrumentsGetPayloadType }) {
      yield* race({
        task: call(
          handleInitiativesFromInstrumentRefresh,
          action.payload.initiativeId
        ),
        cancel: take(instrumentRefreshChannel)
      });
    }
  );

  yield* takeEvery(idPayInitiativesInstrumentRefreshStop, function* () {
    yield* put(instrumentRefreshChannel, "kill");
  });
}
