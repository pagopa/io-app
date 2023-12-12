import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { AmountEuroCents } from "../../../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { RequestAuthorizationResponse } from "../../../../../../../definitions/pagopa/ecommerce/RequestAuthorizationResponse";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../../fastLogin/saga/utils";
import {
  WalletPaymentAuthorizePayload,
  walletPaymentAuthorization
} from "../../../store/actions/networking";
import { handleWalletPaymentAuthorization } from "../handleWalletPaymentAuthorization";

describe("Test handleWalletPaymentAuthorization saga", () => {
  const requestTransactionAuthorizationPayload: WalletPaymentAuthorizePayload =
    {
      paymentAmount: 1234 as AmountEuroCents,
      paymentFees: 123 as AmountEuroCents,
      pspId: "",
      transactionId: "",
      walletId: ""
    };

  it(`should put ${getType(
    walletPaymentAuthorization.success
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
      walletPaymentAuthorization.request(requestTransactionAuthorizationPayload)
    )
      .next()
      .call(
        withRefreshApiCall,
        mockRequestTransactionAuthorization(),
        walletPaymentAuthorization.request(
          requestTransactionAuthorizationPayload
        )
      )
      .next(
        E.right({ status: 200, value: requestTransactionAuthorizationResponse })
      )
      .put(
        walletPaymentAuthorization.success(
          requestTransactionAuthorizationResponse
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentAuthorization.failure
  )} when requestTransactionAuthorization is not 200`, () => {
    const mockRequestTransactionAuthorization = jest.fn();

    testSaga(
      handleWalletPaymentAuthorization,
      mockRequestTransactionAuthorization,
      walletPaymentAuthorization.request(requestTransactionAuthorizationPayload)
    )
      .next()
      .call(
        withRefreshApiCall,
        mockRequestTransactionAuthorization(),
        walletPaymentAuthorization.request(
          requestTransactionAuthorizationPayload
        )
      )
      .next(E.right({ status: 400, value: undefined }))
      .put(
        walletPaymentAuthorization.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentAuthorization.failure
  )} when requestTransactionAuthorization encoders returns an error`, () => {
    const mockRequestTransactionAuthorization = jest.fn();

    testSaga(
      handleWalletPaymentAuthorization,
      mockRequestTransactionAuthorization,
      walletPaymentAuthorization.request(requestTransactionAuthorizationPayload)
    )
      .next()
      .call(
        withRefreshApiCall,
        mockRequestTransactionAuthorization(),
        walletPaymentAuthorization.request(
          requestTransactionAuthorizationPayload
        )
      )
      .next(E.left([]))
      .put(
        walletPaymentAuthorization.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
