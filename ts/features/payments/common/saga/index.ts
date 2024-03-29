import { SagaIterator } from "redux-saga";
import { fork, select } from "typed-redux-saga/macro";
import { isPagoPATestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { watchPaymentsOnboardingSaga } from "../../onboarding/saga";
import { createPaymentClient } from "../../payment/api/client";
import { watchPaymentsPaymentSaga } from "../../payment/saga";
import { createWalletClient } from "../api/client";
import { walletApiBaseUrl, walletApiUatBaseUrl } from "../../../../config";
import { watchPaymentsMethodDetailsSaga } from "../../details/saga";
import { watchPaymentsTransactionSaga } from "../../transaction/saga";

export function* watchPaymentsSaga(walletToken: string): SagaIterator {
  const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);

  const walletBaseUrl = isPagoPATestEnabled
    ? walletApiUatBaseUrl
    : walletApiBaseUrl;

  const walletClient = createWalletClient(walletBaseUrl, walletToken);
  const paymentClient = createPaymentClient(walletBaseUrl, walletToken);

  yield* fork(watchPaymentsOnboardingSaga, walletClient);
  yield* fork(watchPaymentsMethodDetailsSaga, walletClient);
  yield* fork(watchPaymentsTransactionSaga, walletClient);
  yield* fork(watchPaymentsPaymentSaga, paymentClient);
}
