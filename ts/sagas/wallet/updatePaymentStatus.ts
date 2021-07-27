import { ActionType } from "typesafe-actions";
import { call, put } from "redux-saga/effects";
import {
  fetchWalletsRequestWithExpBackoff,
  updatePaymentStatus
} from "../../store/actions/wallet/wallets";
import { PaymentManagerClient } from "../../api/pagopa";
import { SessionManager } from "../../utils/SessionManager";
import { PaymentManagerToken } from "../../types/pagopa";
import { updatePaymentStatusSaga } from "./pagopaApis";

/**
 * handle the request of update a payment method to enable/disable it to pay with pagoPA
 * it uses a dedicated API to update the payment method and waits until the request has been completed
 * then it reloads the wallet list to spread the refreshed payment methods
 * @param paymentManagerClient
 * @param pmSessionManager
 * @param action
 */
export function* handleUpdatePaymentStatus(
  paymentManagerClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof updatePaymentStatus.request>
) {
  yield call(
    updatePaymentStatusSaga,
    paymentManagerClient,
    pmSessionManager,
    action
  );
  yield put(fetchWalletsRequestWithExpBackoff());
}
