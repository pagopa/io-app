import { SagaIterator } from "redux-saga";
import { fork, select, takeLatest } from "typed-redux-saga/macro";
import { walletApiBaseUrl, walletApiUatBaseUrl } from "../../../../config";
import { isPagoPATestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { watchPaymentsCheckoutSaga } from "../../checkout/saga";
import { watchPaymentsMethodDetailsSaga } from "../../details/saga";
import { watchPaymentsNoticeSaga } from "../../notices/saga";
import { watchPaymentsOnboardingSaga } from "../../onboarding/saga";
import { watchPaymentsWalletSaga } from "../../wallet/saga";
import {
  createPagoPaClient,
  createPaymentClient,
  createTransactionClient,
  createWalletClient
} from "../api/client";
import { paymentsGetPagoPaPlatformSessionTokenAction } from "../store/actions";
import { handlePaymentsSessionToken } from "./handlePaymentsSessionToken";
import { handleResumePaymentsPendingActions } from "./handleResumePaymentsPendingActions";

export function* watchPaymentsSaga(walletToken: string): SagaIterator {
  const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);

  const walletBaseUrl = isPagoPATestEnabled
    ? walletApiUatBaseUrl
    : walletApiBaseUrl;

  const walletClient = createWalletClient(walletBaseUrl);
  const paymentClient = createPaymentClient(walletBaseUrl);
  const transactionClient = createTransactionClient(walletBaseUrl);
  const pagoPaPlatformClient = createPagoPaClient(walletBaseUrl, walletToken);

  yield* takeLatest(
    paymentsGetPagoPaPlatformSessionTokenAction.request,
    handlePaymentsSessionToken,
    pagoPaPlatformClient.generateSessionWallet
  );

  yield* takeLatest(
    paymentsGetPagoPaPlatformSessionTokenAction.success,
    handleResumePaymentsPendingActions
  );

  yield* fork(watchPaymentsWalletSaga, walletClient);
  yield* fork(watchPaymentsOnboardingSaga, walletClient);
  yield* fork(watchPaymentsMethodDetailsSaga, walletClient);
  yield* fork(watchPaymentsNoticeSaga, transactionClient);
  yield* fork(watchPaymentsCheckoutSaga, paymentClient);
}
