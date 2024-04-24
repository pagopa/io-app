import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ApmDetailTypeEnum } from "../../../../../../definitions/pagopa/ecommerce/ApmDetailType";
import { AuthorizationDetails } from "../../../../../../definitions/pagopa/ecommerce/AuthorizationDetails";
import {
  LanguageEnum,
  RequestAuthorizationRequest
} from "../../../../../../definitions/pagopa/ecommerce/RequestAuthorizationRequest";
import { WalletDetailTypeEnum } from "../../../../../../definitions/pagopa/ecommerce/WalletDetailType";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../../common/api/client";
import { paymentsStartPaymentAuthorizationAction } from "../../store/actions/networking";
import { getOrFetchWalletSessionToken } from "./handleWalletPaymentNewSessionToken";

export function* handleWalletPaymentAuthorization(
  requestTransactionAuthorization: PaymentClient["requestTransactionAuthorization"],
  action: ActionType<
    (typeof paymentsStartPaymentAuthorizationAction)["request"]
  >
) {
  try {
    const sessionToken = yield* getOrFetchWalletSessionToken();

    if (sessionToken === undefined) {
      yield* put(
        paymentsStartPaymentAuthorizationAction.failure({
          ...getGenericError(new Error(`Missing session token`))
        })
      );
      return;
    }

    const details: AuthorizationDetails =
      action.payload.walletId !== undefined
        ? {
          detailType: WalletDetailTypeEnum.wallet,
          walletId: action.payload.walletId
        }
        : {
          detailType: ApmDetailTypeEnum.apm,
          paymentMethodId: action.payload.paymentMethodId
        };

    const requestBody: RequestAuthorizationRequest = {
      amount: action.payload.paymentAmount,
      fee: action.payload.paymentFees,
      isAllCCP: true,
      language: LanguageEnum.IT,
      pspId: action.payload.pspId,
      details
    };
    const requestTransactionAuthorizationRequest =
      requestTransactionAuthorization({
        transactionId: action.payload.transactionId,
        body: requestBody,
        eCommerceSessionToken: sessionToken
      });

    const requestTransactionAuthorizationResult = (yield* call(
      withRefreshApiCall,
      requestTransactionAuthorizationRequest,
      action
    )) as SagaCallReturnType<typeof requestTransactionAuthorization>;

    if (E.isLeft(requestTransactionAuthorizationResult)) {
      yield* put(
        paymentsStartPaymentAuthorizationAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(requestTransactionAuthorizationResult.left))
          )
        })
      );
      return;
    }

    if (requestTransactionAuthorizationResult.right.status === 200) {
      yield* put(
        paymentsStartPaymentAuthorizationAction.success(
          requestTransactionAuthorizationResult.right.value
        )
      );
    } else if (requestTransactionAuthorizationResult.right.status !== 401) {
      yield* put(
        paymentsStartPaymentAuthorizationAction.failure({
          ...getGenericError(new Error(`Error: ${requestTransactionAuthorizationResult.right.status}`))
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsStartPaymentAuthorizationAction.failure({ ...getNetworkError(e) })
    );
  }
}
