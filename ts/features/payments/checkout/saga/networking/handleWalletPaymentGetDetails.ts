import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../../common/api/client";
import { paymentsGetPaymentDetailsAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";

export function* handleWalletPaymentGetDetails(
  getPaymentRequestInfo: PaymentClient["getPaymentRequestInfoForIO"],
  action: ActionType<(typeof paymentsGetPaymentDetailsAction)["request"]>
) {
  try {
    const getPaymentRequestInfoRequest = yield* withPaymentsSessionToken(
      getPaymentRequestInfo,
      paymentsGetPaymentDetailsAction.failure,
      {
        rpt_id: action.payload
      },
      "pagoPAPlatformSessionToken"
    );

    if (!getPaymentRequestInfoRequest) {
      return;
    }

    const getPaymentRequestInfoResult = (yield* call(
      withRefreshApiCall,
      getPaymentRequestInfoRequest,
      action
    )) as SagaCallReturnType<typeof getPaymentRequestInfo>;

    yield* put(
      pipe(
        getPaymentRequestInfoResult,
        E.fold(
          error =>
            paymentsGetPaymentDetailsAction.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),
          ({ status, value }) => {
            if (status === 200) {
              return paymentsGetPaymentDetailsAction.success(value);
            } else if (status === 400) {
              return paymentsGetPaymentDetailsAction.failure({
                ...getGenericError(new Error(`Error: ${status}`))
              });
            } else {
              return paymentsGetPaymentDetailsAction.failure(value);
            }
          }
        )
      )
    );
  } catch (e) {
    yield* put(
      paymentsGetPaymentDetailsAction.failure({ ...getNetworkError(e) })
    );
  }
}
