import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import {
  LanguageEnum,
  RequestAuthorizationRequest
} from "../../../../../../definitions/pagopa/ecommerce/RequestAuthorizationRequest";
import { WalletDetailTypeEnum } from "../../../../../../definitions/pagopa/ecommerce/WalletDetailType";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentAuthorization } from "../../store/actions/networking";

export function* handleWalletPaymentAuthorization(
  requestTransactionAuthorization: PaymentClient["requestTransactionAuthorization"],
  action: ActionType<(typeof walletPaymentAuthorization)["request"]>
) {
  const requestBody: RequestAuthorizationRequest = {
    amount: action.payload.paymentAmount,
    fee: action.payload.paymentFees,
    isAllCCP: true,
    language: LanguageEnum.IT,
    pspId: action.payload.pspId,
    details: {
      detailType: WalletDetailTypeEnum.wallet,
      walletId: action.payload.walletId
    }
  };
  const requestTransactionAuthorizationRequest =
    requestTransactionAuthorization({
      transactionId: action.payload.transactionId,
      body: requestBody
    });

  try {
    const requestTransactionAuthorizationResult = (yield* call(
      withRefreshApiCall,
      requestTransactionAuthorizationRequest,
      action
    )) as unknown as SagaCallReturnType<typeof requestTransactionAuthorization>;

    yield* put(
      pipe(
        requestTransactionAuthorizationResult,
        E.fold(
          error =>
            walletPaymentAuthorization.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),

          res => {
            if (res.status === 200) {
              return walletPaymentAuthorization.success(res.value);
            }
            return walletPaymentAuthorization.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(walletPaymentAuthorization.failure({ ...getNetworkError(e) }));
  }
}
