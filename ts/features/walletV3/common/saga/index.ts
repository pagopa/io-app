import { SagaIterator } from "redux-saga";
import { fork, select } from "typed-redux-saga/macro";
import { isPagoPATestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { watchWalletOnboardingSaga } from "../../onboarding/saga";
import { createPaymentClient } from "../../payment/api/client";
import { watchWalletPaymentSaga } from "../../payment/saga";
import { createWalletClient } from "../api/client";
import { walletApiBaseUrl, walletApiUatBaseUrl } from "../../../../config";
import { watchWalletDetailsSaga } from "../../details/saga";
import { watchWalletTransactionSaga } from "../../transaction/saga";

export function* watchWalletSaga(walletToken: string): SagaIterator {
  const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);

  const walletBaseUrl = isPagoPATestEnabled
    ? walletApiUatBaseUrl
    : walletApiBaseUrl;

  const walletClient = createWalletClient(walletBaseUrl, walletToken);
  const paymentClient = createPaymentClient(walletBaseUrl, walletToken);

  yield* fork(watchWalletOnboardingSaga, walletClient);
  yield* fork(watchWalletPaymentSaga, walletClient, paymentClient);
  yield* fork(watchWalletDetailsSaga, walletClient);
  yield* fork(watchWalletTransactionSaga, walletClient);
}
