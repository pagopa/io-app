import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { PaymentRequestsGetResponse } from "../../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../../../definitions/pagopa/ecommerce/RptId";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { paymentsGetPaymentDetailsAction } from "../../../store/actions/networking";
import { handleWalletPaymentGetDetails } from "../handleWalletPaymentGetDetails";

describe("Test handleWalletPaymentGetDetails saga", () => {
  const rptId = "12345" as RptId;
  const T_SESSION_TOKEN = "ABCD";

  it(`should put ${getType(
    paymentsGetPaymentDetailsAction.success
  )} when getPaymentRequestInfo is 200`, () => {
    const mockGetPaymentRequestInfo = jest.fn();
    const getPaymentRequestInfoResponse: PaymentRequestsGetResponse = {
      amount: 1234 as PaymentRequestsGetResponse["amount"]
    };

    testSaga(
      handleWalletPaymentGetDetails,
      mockGetPaymentRequestInfo,
      paymentsGetPaymentDetailsAction.request(rptId)
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 200, value: getPaymentRequestInfoResponse }))
      .put(
        paymentsGetPaymentDetailsAction.success(getPaymentRequestInfoResponse)
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    paymentsGetPaymentDetailsAction.failure
  )} when getPaymentRequestInfo is not 200`, () => {
    const mockGetPaymentRequestInfo = jest.fn();

    testSaga(
      handleWalletPaymentGetDetails,
      mockGetPaymentRequestInfo,
      paymentsGetPaymentDetailsAction.request(rptId)
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 400, value: undefined }))
      .put(
        paymentsGetPaymentDetailsAction.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    paymentsGetPaymentDetailsAction.failure
  )} when getPaymentRequestInfo encoders returns an error`, () => {
    const mockGetPaymentRequestInfo = jest.fn();

    testSaga(
      handleWalletPaymentGetDetails,
      mockGetPaymentRequestInfo,
      paymentsGetPaymentDetailsAction.request(rptId)
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.left([]))
      .put(
        paymentsGetPaymentDetailsAction.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
