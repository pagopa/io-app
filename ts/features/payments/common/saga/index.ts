import { SagaIterator } from "redux-saga";
import { fork, select } from "typed-redux-saga/macro";
import { isPagoPATestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { watchPaymentsOnboardingSaga } from "../../onboarding/saga";
import { watchPaymentsCheckoutSaga } from "../../checkout/saga";
import { createPaymentClient, createWalletClient } from "../api/client";
import { walletApiBaseUrl, walletApiUatBaseUrl } from "../../../../config";
import { watchPaymentsMethodDetailsSaga } from "../../details/saga";
import { watchPaymentsTransactionSaga } from "../../transaction/saga";
import { watchPaymentsWalletSaga } from "../../wallet/saga";

export function* watchPaymentsSaga(walletToken: string): SagaIterator {
  const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);

  const walletBaseUrl = isPagoPATestEnabled
    ? walletApiUatBaseUrl
    : walletApiBaseUrl;

  const walletClient = createWalletClient(walletBaseUrl, walletToken);
  const paymentClient = createPaymentClient(walletBaseUrl, walletToken);

  yield* fork(watchPaymentsWalletSaga, walletClient);
  yield* fork(watchPaymentsOnboardingSaga, walletClient);
  yield* fork(watchPaymentsMethodDetailsSaga, walletClient);
  yield* fork(watchPaymentsTransactionSaga, walletClient);
  yield* fork(watchPaymentsCheckoutSaga, paymentClient);
}
