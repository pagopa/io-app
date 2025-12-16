import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { Range } from "../../../../../../../definitions/pagopa/ecommerce/Range";
import { PaymentMethodStatusEnum } from "../../../../../../../definitions/pagopa/ecommerce/PaymentMethodStatus";
import { PaymentMethodsResponse } from "../../../../../../../definitions/pagopa/ecommerce/PaymentMethodsResponse";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { paymentsGetPaymentMethodsAction } from "../../../store/actions/networking";
import { handleWalletPaymentGetAllMethods } from "../handleWalletPaymentGetAllMethods";
import { PaymentMethodManagementTypeEnum } from "../../../../../../../definitions/pagopa/ecommerce/PaymentMethodManagementType";

describe("Test handleWalletPaymentGetAllMethods saga", () => {
  const T_SESSION_TOKEN = "ABCD";
  const MOCK_AMOUNT = 6005;

  it(`should put ${getType(
    paymentsGetPaymentMethodsAction.success
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
          status: PaymentMethodStatusEnum.ENABLED,
          methodManagement: PaymentMethodManagementTypeEnum.ONBOARDABLE
        }
      ]
    };

    testSaga(
      handleWalletPaymentGetAllMethods,
      mockGetAllPaymentMethods,
      paymentsGetPaymentMethodsAction.request({ amount: MOCK_AMOUNT })
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 200, value: getAllPaymentMethodsResponse }))
      .put(
        paymentsGetPaymentMethodsAction.success(getAllPaymentMethodsResponse)
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    paymentsGetPaymentMethodsAction.failure
  )} when getAllPaymentMethods is not 200`, () => {
    const mockGetAllPaymentMethods = jest.fn();

    testSaga(
      handleWalletPaymentGetAllMethods,
      mockGetAllPaymentMethods,
      paymentsGetPaymentMethodsAction.request({ amount: MOCK_AMOUNT })
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 400, value: undefined }))
      .put(
        paymentsGetPaymentMethodsAction.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    paymentsGetPaymentMethodsAction.failure
  )} when getAllPaymentMethods encoders returns an error`, () => {
    const mockGetAllPaymentMethods = jest.fn();

    testSaga(
      handleWalletPaymentGetAllMethods,
      mockGetAllPaymentMethods,
      paymentsGetPaymentMethodsAction.request({ amount: MOCK_AMOUNT })
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.left([]))
      .put(
        paymentsGetPaymentMethodsAction.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
