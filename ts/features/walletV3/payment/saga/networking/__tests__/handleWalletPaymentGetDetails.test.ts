import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { PaymentRequestsGetResponse } from "../../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../../../definitions/pagopa/ecommerce/RptId";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../../fastLogin/saga/utils";
import { walletPaymentGetDetails } from "../../../store/actions/networking";
import { handleWalletPaymentGetDetails } from "../handleWalletPaymentGetDetails";

describe("Test handleWalletPaymentGetDetails saga", () => {
  const rptId = "12345" as RptId;

  it(`should put ${getType(
    walletPaymentGetDetails.success
  )} when getPaymentRequestInfo is 200`, () => {
    const mockGetPaymentRequestInfo = jest.fn();
    const getPaymentRequestInfoResponse: PaymentRequestsGetResponse = {
      amount: 1234 as PaymentRequestsGetResponse["amount"]
    };

    testSaga(
      handleWalletPaymentGetDetails,
      mockGetPaymentRequestInfo,
      walletPaymentGetDetails.request(rptId)
    )
      .next()
      .call(
        withRefreshApiCall,
        mockGetPaymentRequestInfo(),
        walletPaymentGetDetails.request(rptId)
      )
      .next(E.right({ status: 200, value: getPaymentRequestInfoResponse }))
      .put(walletPaymentGetDetails.success(getPaymentRequestInfoResponse))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentGetDetails.failure
  )} when getPaymentRequestInfo is not 200`, () => {
    const mockGetPaymentRequestInfo = jest.fn();

    testSaga(
      handleWalletPaymentGetDetails,
      mockGetPaymentRequestInfo,
      walletPaymentGetDetails.request(rptId)
    )
      .next()
      .call(
        withRefreshApiCall,
        mockGetPaymentRequestInfo(),
        walletPaymentGetDetails.request(rptId)
      )
      .next(E.right({ status: 400, value: undefined }))
      .put(
        walletPaymentGetDetails.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentGetDetails.failure
  )} when getPaymentRequestInfo encoders returns an error`, () => {
    const mockGetPaymentRequestInfo = jest.fn();

    testSaga(
      handleWalletPaymentGetDetails,
      mockGetPaymentRequestInfo,
      walletPaymentGetDetails.request(rptId)
    )
      .next()
      .call(
        withRefreshApiCall,
        mockGetPaymentRequestInfo(),
        walletPaymentGetDetails.request(rptId)
      )
      .next(E.left([]))
      .put(
        walletPaymentGetDetails.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
