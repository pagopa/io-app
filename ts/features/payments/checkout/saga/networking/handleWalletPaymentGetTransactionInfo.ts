import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { PaymentClient } from "../../../common/api/client";
import { paymentsGetPaymentTransactionInfoAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";

export function* handleWalletPaymentGetTransactionInfo(
  getTransactionInfo: PaymentClient["getTransactionInfoForIO"],
  action: ActionType<
    (typeof paymentsGetPaymentTransactionInfoAction)["request"]
  >
) {
  try {
    const getTransactionInfoResult = yield* withPaymentsSessionToken(
      getTransactionInfo,
      action,
      {
        transactionId: action.payload.transactionId
      },
      "pagoPAPlatformSessionToken"
    );

    if (E.isLeft(getTransactionInfoResult)) {
      yield* put(
        paymentsGetPaymentTransactionInfoAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionInfoResult.left))
          )
        })
      );
      return;
    }

    if (getTransactionInfoResult.right.status === 200) {
      yield* put(
        paymentsGetPaymentTransactionInfoAction.success(
          getTransactionInfoResult.right.value
        )
      );
    } else if (getTransactionInfoResult.right.status !== 401) {
      // The 401 is handled by the withPaymentsSessionToken
      yield* put(
        paymentsGetPaymentTransactionInfoAction.failure({
          ...getGenericError(
            new Error(JSON.stringify(getTransactionInfoResult.right.value))
          )
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsGetPaymentTransactionInfoAction.failure({ ...getNetworkError(e) })
    );
  }
}
