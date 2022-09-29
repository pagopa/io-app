import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
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
): E.Either<NetworkError, RawPrivativePaymentMethod> =>
  isRawPrivative(rpm)
    ? E.right(rpm)
    : E.left(
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
  const result: SagaCallReturnType<typeof addCobadgeToWallet> = yield* call(
    addCobadgeToWallet,
    addCobadgeToWalletClient,
    sessionManager,
    addAction.payload
  );

  const eitherRawPrivative = pipe(result, E.chain(toRawPrivativePaymentMethod));

  // dispatch the related action
  if (E.isRight(eitherRawPrivative)) {
    yield* put(addPrivativeToWallet.success(eitherRawPrivative.right));
  } else {
    yield* put(addPrivativeToWallet.failure(eitherRawPrivative.left));
  }
}
