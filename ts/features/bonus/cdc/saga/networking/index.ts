import { SagaIterator } from "redux-saga";
import { call } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../../config";
import { BackendCdcClient } from "../../api/backendCdc";
import { PublicSession } from "../../../../../../definitions/backend/PublicSession";

export function* watchBonusCdcSaga(publicSession: PublicSession): SagaIterator {
  // Client for the Cdc
  const cdcClient: BackendCdcClient = BackendCdcClient(
    apiUrlPrefix,
    publicSession.bpdToken
  );

  yield* call(cdcClient.getStatoBeneficiario, {});

  yield* call(
    cdcClient.postRegistraBeneficiario({
      anniRiferimento: {
        anniRif: [{ anno: "2028" }]
      }
    }),
    {}
  );
}
