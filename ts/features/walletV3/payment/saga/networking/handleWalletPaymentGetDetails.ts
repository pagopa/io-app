import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { FaultCategoryEnum } from "../../../../../../definitions/pagopa/ecommerce/FaultCategory";
import { GatewayFaultEnum } from "../../../../../../definitions/pagopa/ecommerce/GatewayFault";
import { SagaCallReturnType } from "../../../../../types/utils";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentGetDetails } from "../../store/actions/networking";
import { getGenericError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";

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
          ({ status, value }) => {
            if (status === 200) {
              return walletPaymentGetDetails.success(value);
            } else if (status === 400) {
              return walletPaymentGetDetails.failure({
                ...getGenericError(new Error(`Error: ${status}`))
              });
            } else {
              return walletPaymentGetDetails.failure(value);
            }
          }
        )
      )
    );
  } catch (e) {
    yield* put(
      walletPaymentGetDetails.failure({
        faultCodeCategory: FaultCategoryEnum.GENERIC_ERROR,
        faultCodeDetail: GatewayFaultEnum.GENERIC_ERROR
      })
    );
  }
}
