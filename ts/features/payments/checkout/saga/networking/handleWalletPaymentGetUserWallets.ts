import * as E from "fp-ts/lib/Either";
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
      action,
      {},
      "pagoPAPlatformSessionToken"
    );

    if (E.isLeft(getWalletsByIdUserResult)) {
      yield* put(
        paymentsGetPaymentUserMethodsAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getWalletsByIdUserResult.left))
          )
        })
      );
      return;
    }

    const res = getWalletsByIdUserResult.right;
    if (action.payload.onResponse) {
      action.payload.onResponse(
        res.status === 200 ? res.value.wallets : undefined
      );
    }
    if (res.status === 200) {
      yield* put(paymentsGetPaymentUserMethodsAction.success(res.value));
    } else if (res.status === 404) {
      paymentsGetPaymentUserMethodsAction.success({
        wallets: []
      });
    } else if (res.status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      yield* put(
        paymentsGetPaymentUserMethodsAction.failure({
          ...getGenericError(new Error(`Error: ${res.status}`))
        })
      );
    }
  } catch (e) {
    if (action.payload.onResponse) {
      action.payload.onResponse(undefined);
    }
    yield* put(
      paymentsGetPaymentUserMethodsAction.failure({ ...getNetworkError(e) })
    );
  }
}
