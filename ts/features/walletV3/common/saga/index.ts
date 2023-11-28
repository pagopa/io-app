import { SagaIterator } from "redux-saga";
import { fork, select } from "typed-redux-saga/macro";
import {
  idPayTestToken,
  walletV3ApiBaseUrl,
  walletV3ApiUatBaseUrl
} from "../../../../config";
import { isPagoPATestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { createWalletClient } from "../api/client";
import { watchWalletOnboardingSaga } from "../../onboarding/saga";
import { watchWalletDetailsSaga } from "../../details/saga";

export function* watchWalletV3Saga(bpdToken: string): SagaIterator {
  const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);

  const baseUrl = isPagoPATestEnabled
    ? walletV3ApiUatBaseUrl
    : walletV3ApiBaseUrl;
  const token = idPayTestToken ?? bpdToken;

  const client = createWalletClient(baseUrl);

  yield* fork(watchWalletOnboardingSaga, client, token);

  yield* fork(watchWalletDetailsSaga, client, token);
}
