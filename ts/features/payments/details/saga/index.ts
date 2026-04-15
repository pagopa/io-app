import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { WalletClient } from "../../common/api/client";
import {
  paymentsDeleteMethodAction,
  paymentsGetMethodDetailsAction,
  paymentsTogglePagoPaCapabilityAction
} from "../store/actions";
import { handleDeleteWalletDetails } from "./handleDeleteWalletDetails";
import { handleGetWalletDetails } from "./handleGetWalletDetails";
import { handleTogglePagoPaCapability } from "./handleTogglePagoPaCapability";

/**
 * Handle payment method onboarding requests
 * @param walletClient wallet client
 */
export function* watchPaymentsMethodDetailsSaga(
  walletClient: WalletClient
): SagaIterator {
  // handle the request of get wallet details
  yield* takeLatest(
    paymentsGetMethodDetailsAction.request,
    handleGetWalletDetails,
    walletClient.getIOPaymentWalletById
  );

  // handle the request of delete a wallet
  yield* takeLatest(
    paymentsDeleteMethodAction.request,
    handleDeleteWalletDetails,
    walletClient.deleteIOPaymentWalletById
  );

  // handle request to a wallet
  yield* takeLatest(
    paymentsTogglePagoPaCapabilityAction.request,
    handleTogglePagoPaCapability,
    walletClient.updateIOPaymentWalletApplicationsById
  );
}
