import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ApmDetailTypeEnum } from "../../../../../../definitions/pagopa/ecommerce/ApmDetailType";
import { AuthorizationDetails } from "../../../../../../definitions/pagopa/ecommerce/AuthorizationDetails";
import { PaymentMethodManagementTypeEnum } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodManagementType";
import { RedirectDetailTypeEnum } from "../../../../../../definitions/pagopa/ecommerce/RedirectDetailType";
import { RequestAuthorizationRequest } from "../../../../../../definitions/pagopa/ecommerce/RequestAuthorizationRequest";
import { WalletDetailTypeEnum } from "../../../../../../definitions/pagopa/ecommerce/WalletDetailType";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { getLanguageEnumFromPreferredLocale } from "../../../../../utils/locale";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { PaymentClient } from "../../../common/api/client";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";
import { paymentsStartPaymentAuthorizationAction } from "../../store/actions/networking";

export function* handleWalletPaymentAuthorization(
  requestTransactionAuthorization: PaymentClient["requestTransactionAuthorizationForIO"],
  action: ActionType<
    (typeof paymentsStartPaymentAuthorizationAction)["request"]
  >
) {
  try {
    const details: AuthorizationDetails =
      action.payload.walletId !== undefined
        ? {
            detailType: WalletDetailTypeEnum.wallet,
            walletId: action.payload.walletId
          }
        : {
            detailType:
              action.payload.paymentMethodManagement ===
              PaymentMethodManagementTypeEnum.REDIRECT
                ? RedirectDetailTypeEnum.redirect
                : ApmDetailTypeEnum.apm,
            paymentMethodId: action.payload.paymentMethodId
          };

    const language = getLanguageEnumFromPreferredLocale();

    const requestBody: RequestAuthorizationRequest = {
      amount: action.payload.paymentAmount,
      fee: action.payload.paymentFees,
      isAllCCP: action.payload.isAllCCP,
      language,
      pspId: action.payload.pspId,
      details
    };

    const requestTransactionAuthorizationResult =
      yield* withPaymentsSessionToken(
        requestTransactionAuthorization,
        action,
        {
          transactionId: action.payload.transactionId,
          body: requestBody
        },
        "pagoPAPlatformSessionToken"
      );

    if (E.isLeft(requestTransactionAuthorizationResult)) {
      yield* put(
        paymentsStartPaymentAuthorizationAction.failure({
          ...getGenericError(
            new Error(
              readablePrivacyReport(requestTransactionAuthorizationResult.left)
            )
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
      // The 401 status is handled by the withPaymentsSessionToken
      yield* put(
        paymentsStartPaymentAuthorizationAction.failure({
          ...getGenericError(
            new Error(
              `Error: ${requestTransactionAuthorizationResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsStartPaymentAuthorizationAction.failure({ ...getNetworkError(e) })
    );
  }
}
