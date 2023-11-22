import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { PaymentClient } from "../api/client";
import { walletGetPaymentDetails } from "../store/actions";

/**
 * Handle the remote call to verify an RptId and get associated payment details
 * @param getPaymentRequestInfo
 * @param authToken
 */
export function* handleWalletGetPaymentDetails(
  getPaymentRequestInfo: PaymentClient["getPaymentRequestInfo"],
  action: ActionType<(typeof walletGetPaymentDetails)["request"]>
) {
  const getPaymentRequestInfoRequest = getPaymentRequestInfo({
    rpt_id: action.payload.rptId
  });

  try {
    const getPaymentRequestInfoResult = (yield* call(
      withRefreshApiCall,
      getPaymentRequestInfoRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getPaymentRequestInfo>;

    yield* put(
      pipe(
        getPaymentRequestInfoResult,
        E.fold(
          error =>
            walletGetPaymentDetails.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),

          res => {
            if (res.status === 200) {
              return walletGetPaymentDetails.success(res.value);
            }
            return walletGetPaymentDetails.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(walletGetPaymentDetails.failure({ ...getNetworkError(e) }));
  }
}
