import { ActionType, getType } from "typesafe-actions";
import { call, put, take } from "redux-saga/effects";
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
 * it uses a dedicated API to update the payment method and waits for a result action (success/failure)
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
  const updatePaymentOutcome: ActionType<
    typeof updatePaymentStatus.success | typeof updatePaymentStatus.failure
  > = yield take([
    getType(updatePaymentStatus.success),
    getType(updatePaymentStatus.failure)
  ]);
  if (updatePaymentOutcome.type === getType(updatePaymentStatus.success)) {
    yield put(fetchWalletsRequestWithExpBackoff());
  }
}
