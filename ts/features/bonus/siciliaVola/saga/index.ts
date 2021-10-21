import { takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { SagaIterator } from "redux-saga";
import { none, some } from "fp-ts/lib/Option";
import { SessionManager } from "../../../../utils/SessionManager";
import { apiUrlPrefix } from "../../../../config";
import {
  svGenerateVoucherAvailableDestination,
  svGenerateVoucherAvailableMunicipality,
  svGenerateVoucherAvailableState,
  svGenerateVoucherGeneratedVoucher,
  svGenerateVoucherStart
} from "../store/actions/voucherGeneration";
import { BackendSiciliaVolaClient } from "../api/backendSiciliaVola";
import { SessionToken } from "../../../../types/SessionToken";
import { MitVoucherToken } from "../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import {
  svAcceptTos,
  svServiceAlive,
  svTosAccepted
} from "../store/actions/activation";
import {
  svPossibleVoucherStateGet,
  svVoucherDetailGet,
  svVoucherListGet,
  svVoucherRevocation
} from "../store/actions/voucherList";
import { handleSvVoucherGenerationStartActivationSaga } from "./orchestration/voucherGeneration";
import { handleSvServiceAlive } from "./networking/handleSvServiceAlive";
import { handleGetStatiUE } from "./networking/handleGetStatiUE";
import { handleSvTosAccepted } from "./networking/handleSvTosAccepted";
import { handleGetListaComuniBySiglaProvincia } from "./networking/handleGetListaComuniBySiglaProvincia";
import { handleGetDettaglioVoucher } from "./networking/handleGetDettaglioVoucher";
import { handlePostAggiungiVoucher } from "./networking/handlePostAggiungiVoucher";
import { handleGetVoucherBeneficiario } from "./networking/handleGetVoucherBeneficiario";
import { handleSvAccepTos } from "./networking/handleSvAcceptTos";
import { handleGetAeroportiAmmessi } from "./networking/handleGetAeroportAmmessi";
import { handleVoucherRevocation } from "./networking/handleVoucherRevocation";
import { handleGetVoucheStati } from "./networking/handleGetVoucherStati";

export function* watchBonusSvSaga(sessionToken: SessionToken): SagaIterator {
  // Client for the Sicilia Vola
  const siciliaVolaClient: BackendSiciliaVolaClient = BackendSiciliaVolaClient(
    apiUrlPrefix,
    sessionToken
  );

  // Helper function that requests a new session token from the SiciliaVola.
  // When calling the Sv APIs, we must use separate session, generated from the
  // sessionToken.
  const getSiciliaVolaSessionToken = async () => {
    try {
      const response = await siciliaVolaClient.getMitVoucherToken(sessionToken);
      if (response.isRight() && response.value.status === 200) {
        return some(response.value.value);
      }
      return none;
    } catch {
      return none;
    }
  };
  // The session manager for SiciliaVola (Sv) will manage the
  // refreshing of the Sv session when calling its APIs, keeping a shared token
  // and serializing the refresh requests.
  const svSessionManager: SessionManager<MitVoucherToken> = new SessionManager(
    getSiciliaVolaSessionToken
  );

  // SV Activation workflow
  yield takeLatest(
    getType(svGenerateVoucherStart),
    handleSvVoucherGenerationStartActivationSaga
  );

  // SV get check if the service is alive
  yield takeLatest(getType(svServiceAlive.request), handleSvServiceAlive);

  // SV get check if the user already accepted the ToS
  // TODO: pass svSessionManager in order to send the MitVoucherToken
  yield takeLatest(getType(svTosAccepted.request), handleSvTosAccepted);

  // SV post the user tos acceptance
  // TODO: pass svSessionManager in order to send the MitVoucherToken
  yield takeLatest(getType(svAcceptTos.request), handleSvAccepTos);

  // SV get the list of UE state
  yield takeLatest(
    getType(svGenerateVoucherAvailableState.request),
    handleGetStatiUE,
    siciliaVolaClient.getStatiUE
  );

  // SV get the list municipalities given a province
  yield takeLatest(
    getType(svGenerateVoucherAvailableMunicipality.request),
    handleGetListaComuniBySiglaProvincia,
    siciliaVolaClient.getListaComuniBySiglaProvincia
  );

  // SV get the list of available destination given a region when the selected state is Italy
  yield takeLatest(
    getType(svGenerateVoucherAvailableDestination.request),
    handleGetAeroportiAmmessi,
    siciliaVolaClient.getAeroportiAmmessi,
    svSessionManager
  );

  // SV post the voucher request
  yield takeLatest(
    getType(svGenerateVoucherGeneratedVoucher.request),
    handlePostAggiungiVoucher,
    svSessionManager
  );

  // SV get the vouchers list already generated
  yield takeLatest(
    getType(svVoucherListGet.request),
    handleGetVoucherBeneficiario,
    siciliaVolaClient.getVoucherBeneficiario,
    svSessionManager
  );

  // SV get the list of the possible voucher state
  yield takeLatest(
    getType(svPossibleVoucherStateGet.request),
    handleGetVoucheStati,
    siciliaVolaClient.getStatiVoucher,
    svSessionManager
  );

  // SV get the voucher details
  // TODO: pass the client when it will be created
  yield takeLatest(
    getType(svVoucherDetailGet.request),
    handleGetDettaglioVoucher,
    svSessionManager
  );

  // SV post the voucher revocation
  yield takeLatest(
    getType(svVoucherRevocation.request),
    handleVoucherRevocation,
    siciliaVolaClient.postAnnullaVoucher,
    svSessionManager
  );
}
