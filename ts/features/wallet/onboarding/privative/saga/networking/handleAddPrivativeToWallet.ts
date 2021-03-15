import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { addCobadgeToWallet } from "../../../cobadge/saga/networking/addCobadgeToWallet";
import { addPrivativeToWallet } from "../../store/actions";

export function* handleAddPrivativeToWallet(
  addCobadgeToWalletClient: ReturnType<
    typeof PaymentManagerClient
  >["addCobadgeToWallet"],
  sessionManager: SessionManager<PaymentManagerToken>,
  addAction: ActionType<typeof addPrivativeToWallet.request>
) {
  // get the results
  const result: SagaCallReturnType<typeof addCobadgeToWallet> = yield call(
    addCobadgeToWallet,
    addCobadgeToWalletClient,
    sessionManager,
    addAction.payload
  );
  // dispatch the related action
  if (result.isRight()) {
    yield put(addPrivativeToWallet.success(result.value));
  } else {
    yield put(addPrivativeToWallet.failure(result.value));
  }
}
