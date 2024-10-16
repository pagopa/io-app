import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { PaymentClient } from "../../common/api/client";
import {
  paymentsCalculatePaymentFeesAction,
  paymentsCreateTransactionAction,
  paymentsDeleteTransactionAction,
  paymentsGetPaymentDetailsAction,
  paymentsGetPaymentMethodsAction,
  paymentsGetPaymentTransactionInfoAction,
  paymentsGetPaymentUserMethodsAction,
  paymentsGetRecentPaymentMethodUsedAction,
  paymentsStartPaymentAuthorizationAction
} from "../store/actions/networking";
import { handleWalletPaymentAuthorization } from "./networking/handleWalletPaymentAuthorization";
import { handleWalletPaymentCalculateFees } from "./networking/handleWalletPaymentCalculateFees";
import { handleWalletPaymentCreateTransaction } from "./networking/handleWalletPaymentCreateTransaction";
import { handleWalletPaymentDeleteTransaction } from "./networking/handleWalletPaymentDeleteTransaction";
import { handleWalletPaymentGetAllMethods } from "./networking/handleWalletPaymentGetAllMethods";
import { handleWalletPaymentGetDetails } from "./networking/handleWalletPaymentGetDetails";
import { handleWalletPaymentGetTransactionInfo } from "./networking/handleWalletPaymentGetTransactionInfo";
import { handleWalletPaymentGetUserWallets } from "./networking/handleWalletPaymentGetUserWallets";
import { handleWalletPaymentGetRecentMethod } from "./networking/handleWalletPaymentGetRecentMethod";

/**
 * Handle the pagoPA payments requests
 * @param bearerToken
 */
export function* watchPaymentsCheckoutSaga(
  paymentClient: PaymentClient
): SagaIterator {
  yield* takeLatest(
    paymentsGetPaymentDetailsAction.request,
    handleWalletPaymentGetDetails,
    paymentClient.getPaymentRequestInfoForIO
  );

  yield* takeLatest(
    paymentsGetPaymentMethodsAction.request,
    handleWalletPaymentGetAllMethods,
    paymentClient.getAllPaymentMethodsForIO
  );

  yield* takeLatest(
    paymentsGetPaymentUserMethodsAction.request,
    handleWalletPaymentGetUserWallets,
    paymentClient.getWalletsByIdIOUser
  );

  yield* takeLatest(
    paymentsCalculatePaymentFeesAction.request,
    handleWalletPaymentCalculateFees,
    paymentClient.calculateFeesForIO
  );

  yield* takeLatest(
    paymentsCreateTransactionAction.request,
    handleWalletPaymentCreateTransaction,
    paymentClient.newTransactionForIO
  );

  yield* takeLatest(
    paymentsGetPaymentTransactionInfoAction.request,
    handleWalletPaymentGetTransactionInfo,
    paymentClient.getTransactionInfoForIO
  );

  yield* takeLatest(
    paymentsDeleteTransactionAction.request,
    handleWalletPaymentDeleteTransaction,
    paymentClient.requestTransactionUserCancellationForIO
  );

  yield* takeLatest(
    paymentsStartPaymentAuthorizationAction.request,
    handleWalletPaymentAuthorization,
    paymentClient.requestTransactionAuthorizationForIO
  );

  yield* takeLatest(
    paymentsGetRecentPaymentMethodUsedAction.request,
    handleWalletPaymentGetRecentMethod,
    paymentClient.getUserLastPaymentMethodUsed
  );
}
