import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { PaymentClient } from "../../../common/api/client";
import { paymentsGetPaymentUserMethodsAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";

export function* handleWalletPaymentGetUserWallets(
  getWalletsByIdUser: PaymentClient["getWalletsByIdIOUser"],
  action: ActionType<(typeof paymentsGetPaymentUserMethodsAction)["request"]>
) {
  try {
    const getWalletsByIdUserResult = yield* withPaymentsSessionToken(
      getWalletsByIdUser,
      paymentsGetPaymentUserMethodsAction.failure,
      action,
      {},
      "pagoPAPlatformSessionToken"
    );

    yield* put(
      pipe(
        getWalletsByIdUserResult,
        E.fold(
          error =>
            paymentsGetPaymentUserMethodsAction.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            ),
          res => {
            if (res.status === 200) {
              return paymentsGetPaymentUserMethodsAction.success(res.value);
            }
            if (res.status === 404) {
              return paymentsGetPaymentUserMethodsAction.success({
                wallets: []
              });
            }
            return paymentsGetPaymentUserMethodsAction.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(
      paymentsGetPaymentUserMethodsAction.failure({ ...getNetworkError(e) })
    );
  }
}
