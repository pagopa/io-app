import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { CalculateFeeResponse } from "../../../../../../../definitions/pagopa/ecommerce/CalculateFeeResponse";
import { PaymentMethodStatusEnum } from "../../../../../../../definitions/pagopa/ecommerce/PaymentMethodStatus";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../../fastLogin/saga/utils";
import { walletPaymentCalculateFees } from "../../../store/actions/networking";
import { handleWalletPaymentCalculateFees } from "../handleWalletPaymentCalculateFees";
import { CalculateFeeRequest } from "../../../../../../../definitions/pagopa/ecommerce/CalculateFeeRequest";

describe("Test handleWalletPaymentCalculateFees saga", () => {
  const calculateFeesPayload: CalculateFeeRequest & {
    paymentMethodId: string;
  } = {
    paymentMethodId: "1234",
    paymentAmount: 1234
  };

  it(`should put ${getType(
    walletPaymentCalculateFees.success
  )} when calculateFees is 200`, () => {
    const mockCalculateFees = jest.fn();
    const calculateFeesResponse: CalculateFeeResponse = {
      bundles: [
        {
          idBundle: "idBundle"
        }
      ],
      paymentMethodDescription: "paymentMethodDescription",
      paymentMethodName: "paymentMethodName",
      paymentMethodStatus: PaymentMethodStatusEnum.ENABLED
    };

    testSaga(
      handleWalletPaymentCalculateFees,
      mockCalculateFees,
      walletPaymentCalculateFees.request(calculateFeesPayload)
    )
      .next()
      .call(
        withRefreshApiCall,
        mockCalculateFees(),
        walletPaymentCalculateFees.request(calculateFeesPayload)
      )
      .next(E.right({ status: 200, value: calculateFeesResponse }))
      .next()
      .put(walletPaymentCalculateFees.success(calculateFeesResponse))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentCalculateFees.failure
  )} when calculateFees is not 200`, () => {
    const mockCalculateFees = jest.fn();

    testSaga(
      handleWalletPaymentCalculateFees,
      mockCalculateFees,
      walletPaymentCalculateFees.request(calculateFeesPayload)
    )
      .next()
      .call(
        withRefreshApiCall,
        mockCalculateFees(),
        walletPaymentCalculateFees.request(calculateFeesPayload)
      )
      .next(E.right({ status: 400, value: undefined }))
      .put(
        walletPaymentCalculateFees.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentCalculateFees.failure
  )} when calculateFees encoders returns an error`, () => {
    const mockCalculateFees = jest.fn();

    testSaga(
      handleWalletPaymentCalculateFees,
      mockCalculateFees,
      walletPaymentCalculateFees.request(calculateFeesPayload)
    )
      .next()
      .call(
        withRefreshApiCall,
        mockCalculateFees(),
        walletPaymentCalculateFees.request(calculateFeesPayload)
      )
      .next(E.left([]))
      .put(
        walletPaymentCalculateFees.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
