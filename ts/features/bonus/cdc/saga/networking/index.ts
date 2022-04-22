import { SagaIterator } from "redux-saga";
import { call } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../../config";
import { BackendCdcClient } from "../../api/backendCdc";
import { PublicSession } from "../../../../../../definitions/backend/PublicSession";
import { Anno } from "../../../../../../definitions/cdc/Anno";

export function* watchBonusCdcSaga(publicSession: PublicSession): SagaIterator {
  // Client for the Cdc
  const cdcClient: BackendCdcClient = BackendCdcClient(
    apiUrlPrefix,
    publicSession.bpdToken
  );

  yield* call(cdcClient.getStatoBeneficiario, {});

  const payload = {
    anniRiferimento: {
      anniRif: [{ anno: "2028" as Anno }]
    }
  };
  yield* call(cdcClient.postRegistraBeneficiario, payload);
}
