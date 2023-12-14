import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { Range } from "../../../../../../../definitions/pagopa/ecommerce/Range";
import { PaymentMethodStatusEnum } from "../../../../../../../definitions/pagopa/walletv3/PaymentMethodStatus";
import { PaymentMethodsResponse } from "../../../../../../../definitions/pagopa/walletv3/PaymentMethodsResponse";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../../fastLogin/saga/utils";
import { walletPaymentGetAllMethods } from "../../../store/actions/networking";
import { handleWalletPaymentGetAllMethods } from "../handleWalletPaymentGetAllMethods";

describe("Test handleWalletPaymentGetAllMethods saga", () => {
  it(`should put ${getType(
    walletPaymentGetAllMethods.success
  )} when getAllPaymentMethods is 200`, () => {
    const mockGetAllPaymentMethods = jest.fn();
    const getAllPaymentMethodsResponse: PaymentMethodsResponse = {
      paymentMethods: [
        {
          description: "description",
          id: "12345",
          name: "name",
          paymentTypeCode: "paymentTypeCode",
          ranges: [
            {
              min: 10 as Range["min"],
              max: 10 as Range["max"]
            }
          ],
          status: PaymentMethodStatusEnum.ENABLED
        }
      ]
    };

    testSaga(
      handleWalletPaymentGetAllMethods,
      mockGetAllPaymentMethods,
      walletPaymentGetAllMethods.request()
    )
      .next()
      .call(
        withRefreshApiCall,
        mockGetAllPaymentMethods(),
        walletPaymentGetAllMethods.request()
      )
      .next(E.right({ status: 200, value: getAllPaymentMethodsResponse }))
      .put(walletPaymentGetAllMethods.success(getAllPaymentMethodsResponse))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentGetAllMethods.failure
  )} when getAllPaymentMethods is not 200`, () => {
    const mockGetAllPaymentMethods = jest.fn();

    testSaga(
      handleWalletPaymentGetAllMethods,
      mockGetAllPaymentMethods,
      walletPaymentGetAllMethods.request()
    )
      .next()
      .call(
        withRefreshApiCall,
        mockGetAllPaymentMethods(),
        walletPaymentGetAllMethods.request()
      )
      .next(E.right({ status: 400, value: undefined }))
      .put(
        walletPaymentGetAllMethods.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentGetAllMethods.failure
  )} when getAllPaymentMethods encoders returns an error`, () => {
    const mockGetAllPaymentMethods = jest.fn();

    testSaga(
      handleWalletPaymentGetAllMethods,
      mockGetAllPaymentMethods,
      walletPaymentGetAllMethods.request()
    )
      .next()
      .call(
        withRefreshApiCall,
        mockGetAllPaymentMethods(),
        walletPaymentGetAllMethods.request()
      )
      .next(E.left([]))
      .put(
        walletPaymentGetAllMethods.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
