import { SagaIterator } from "redux-saga";
import { fork, select } from "typed-redux-saga/macro";
import { watchCdcWalletSaga } from "../../wallet/saga";
import { createCdcClient } from "../api/client";
import { apiUrlPrefix } from "../../../../../config";
import { isCdCWalletVisibilityEnabledSelector } from "../store/selectors/remoteConfig";

export function* watchCdcSaga(sessionToken: string): SagaIterator {
  const cdcClient = createCdcClient(apiUrlPrefix, sessionToken);

  const isCdcWalletVisibilityEnabled = yield* select(
    isCdCWalletVisibilityEnabledSelector
  );
  if (isCdcWalletVisibilityEnabled) {
    yield* fork(watchCdcWalletSaga, cdcClient);
  }
}
