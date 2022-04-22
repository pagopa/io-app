import { SagaIterator } from "redux-saga";
import { call } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../../config";
import { BackendCdcClient } from "../../api/backendCdc";
import { SagaCallReturnType } from "../../../../../types/utils";
import { Anno } from "../../../../../../definitions/cdc/Anno";

export function* watchBonusCdcSaga(bpdBearerToken: string): SagaIterator {
  // Client for the Cdc
  const cdcClient: BackendCdcClient = BackendCdcClient(
    apiUrlPrefix,
    bpdBearerToken
  );

  yield* call(cdcClient.getStatoBeneficiario, {});

  const response: SagaCallReturnType<
    typeof cdcClient["postRegistraBeneficiario"]
  > = yield* call(cdcClient.postRegistraBeneficiario, {
    anniRiferimento: {
      anniRif: [{ anno: "2028" as Anno }]
    }
  };
  yield* call(cdcClient.postRegistraBeneficiario, payload);
}
