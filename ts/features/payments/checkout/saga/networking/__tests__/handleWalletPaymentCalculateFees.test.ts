import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { CalculateFeeRequest } from "../../../../../../../definitions/pagopa/ecommerce/CalculateFeeRequest";
import { CalculateFeeResponse } from "../../../../../../../definitions/pagopa/ecommerce/CalculateFeeResponse";
import { PaymentMethodStatusEnum } from "../../../../../../../definitions/pagopa/ecommerce/PaymentMethodStatus";
import { preferredLanguageSelector } from "../../../../../../store/reducers/persistedPreferences";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { paymentsCalculatePaymentFeesAction } from "../../../store/actions/networking";
import { handleWalletPaymentCalculateFees } from "../handleWalletPaymentCalculateFees";

describe("Test handleWalletPaymentCalculateFees saga", () => {
  const calculateFeesPayload: CalculateFeeRequest & {
    paymentMethodId: string;
  } = {
    paymentMethodId: "1234",
    paymentAmount: 1234
  };
  const T_SESSION_TOKEN = "ABCD";

  it(`should put ${getType(
    paymentsCalculatePaymentFeesAction.success
  )} when calculateFees is 200 and bundles are more than one`, () => {
    const mockCalculateFees = jest.fn();
    const calculateFeesResponse: CalculateFeeResponse = {
      bundles: [
        {
          idBundle: "idBundle"
        },
        {
          idBundle: "idBundle2"
        }
      ],
      asset: "asset",
      paymentMethodDescription: "paymentMethodDescription",
      paymentMethodName: "paymentMethodName",
      paymentMethodStatus: PaymentMethodStatusEnum.ENABLED
    };

    testSaga(
      handleWalletPaymentCalculateFees,
      mockCalculateFees,
      paymentsCalculatePaymentFeesAction.request(calculateFeesPayload)
    )
      .next()
      .select(preferredLanguageSelector)
      .next("IT")
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 200, value: calculateFeesResponse }))
      .put(
        paymentsCalculatePaymentFeesAction.success({
          ...calculateFeesResponse,
          orderId: undefined
        })
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    paymentsCalculatePaymentFeesAction.failure
  )} when calculateFees is not 200`, () => {
    const mockCalculateFees = jest.fn();

    testSaga(
      handleWalletPaymentCalculateFees,
      mockCalculateFees,
      paymentsCalculatePaymentFeesAction.request(calculateFeesPayload)
    )
      .next()
      .select(preferredLanguageSelector)
      .next("IT")
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 400, value: undefined }))
      .put(
        paymentsCalculatePaymentFeesAction.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    paymentsCalculatePaymentFeesAction.failure
  )} when calculateFees encoders returns an error`, () => {
    const mockCalculateFees = jest.fn();

    testSaga(
      handleWalletPaymentCalculateFees,
      mockCalculateFees,
      paymentsCalculatePaymentFeesAction.request(calculateFeesPayload)
    )
      .next()
      .select(preferredLanguageSelector)
      .next("IT")
      .next(T_SESSION_TOKEN)
      .next(E.left([]))
      .put(
        paymentsCalculatePaymentFeesAction.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
