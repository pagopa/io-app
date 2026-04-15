import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { AmountEuroCents } from "../../../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { RequestAuthorizationResponse } from "../../../../../../../definitions/pagopa/ecommerce/RequestAuthorizationResponse";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import {
  WalletPaymentAuthorizePayload,
  paymentsStartPaymentAuthorizationAction
} from "../../../store/actions/networking";
import { handleWalletPaymentAuthorization } from "../handleWalletPaymentAuthorization";
import { PaymentMethodManagementTypeEnum } from "../../../../../../../definitions/pagopa/ecommerce/PaymentMethodManagementType";

describe("Test handleWalletPaymentAuthorization saga", () => {
  const requestTransactionAuthorizationPayload: WalletPaymentAuthorizePayload =
    {
      paymentMethodId: "",
      paymentAmount: 1234 as AmountEuroCents,
      paymentFees: 123 as AmountEuroCents,
      pspId: "",
      isAllCCP: false,
      transactionId: "",
      walletId: "",
      paymentMethodManagement: PaymentMethodManagementTypeEnum.REDIRECT
    };
  const T_SESSION_TOKEN = "ABCD";

  it(`should put ${getType(
    paymentsStartPaymentAuthorizationAction.success
  )} when requestTransactionAuthorization is 200`, () => {
    const mockRequestTransactionAuthorization = jest.fn();
    const requestTransactionAuthorizationResponse: RequestAuthorizationResponse =
      {
        authorizationRequestId: "authorizationRequestId",
        authorizationUrl: "authorizationUrl"
      };

    testSaga(
      handleWalletPaymentAuthorization,
      mockRequestTransactionAuthorization,
      paymentsStartPaymentAuthorizationAction.request(
        requestTransactionAuthorizationPayload
      )
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(
        E.right({ status: 200, value: requestTransactionAuthorizationResponse })
      )
      .put(
        paymentsStartPaymentAuthorizationAction.success(
          requestTransactionAuthorizationResponse
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    paymentsStartPaymentAuthorizationAction.failure
  )} when requestTransactionAuthorization is not 200`, () => {
    const mockRequestTransactionAuthorization = jest.fn();

    testSaga(
      handleWalletPaymentAuthorization,
      mockRequestTransactionAuthorization,
      paymentsStartPaymentAuthorizationAction.request(
        requestTransactionAuthorizationPayload
      )
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 400, value: undefined }))
      .put(
        paymentsStartPaymentAuthorizationAction.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    paymentsStartPaymentAuthorizationAction.failure
  )} when requestTransactionAuthorization encoders returns an error`, () => {
    const mockRequestTransactionAuthorization = jest.fn();

    testSaga(
      handleWalletPaymentAuthorization,
      mockRequestTransactionAuthorization,
      paymentsStartPaymentAuthorizationAction.request(
        requestTransactionAuthorizationPayload
      )
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.left([]))
      .put(
        paymentsStartPaymentAuthorizationAction.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
