import { Either, left, right } from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga";
import { ActionType } from "typesafe-actions";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import {
  isRawPrivative,
  PaymentManagerToken,
  RawPaymentMethod,
  RawPrivativePaymentMethod
} from "../../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getGenericError, NetworkError } from "../../../../../../utils/errors";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { addCobadgeToWallet } from "../../../cobadge/saga/networking/addCobadgeToWallet";
import { addPrivativeToWallet } from "../../store/actions";

const toRawPrivativePaymentMethod = (
  rpm: RawPaymentMethod
): Either<NetworkError, RawPrivativePaymentMethod> =>
  isRawPrivative(rpm)
    ? right(rpm)
    : left(
        getGenericError(
          new Error("Cannot decode the payload as RawPrivativePaymentMethod")
        )
      );

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

  const eitherRawPrivative = result.chain(toRawPrivativePaymentMethod);

  // dispatch the related action
  if (eitherRawPrivative.isRight()) {
    yield put(addPrivativeToWallet.success(eitherRawPrivative.value));
  } else {
    yield put(addPrivativeToWallet.failure(eitherRawPrivative.value));
  }
}
