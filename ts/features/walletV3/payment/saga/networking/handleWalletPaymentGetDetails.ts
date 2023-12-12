import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentGetDetails } from "../../store/actions/networking";

export function* handleWalletPaymentGetDetails(
  getPaymentRequestInfo: PaymentClient["getPaymentRequestInfo"],
  action: ActionType<(typeof walletPaymentGetDetails)["request"]>
) {
  const getPaymentRequestInfoRequest = getPaymentRequestInfo({
    rpt_id: action.payload
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
            walletPaymentGetDetails.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),

          res => {
            if (res.status === 200) {
              return walletPaymentGetDetails.success(res.value);
            }
            return walletPaymentGetDetails.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(walletPaymentGetDetails.failure({ ...getNetworkError(e) }));
  }
}
