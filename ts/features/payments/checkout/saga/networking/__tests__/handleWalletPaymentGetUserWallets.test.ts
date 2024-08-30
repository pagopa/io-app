import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { paymentsGetPaymentUserMethodsAction } from "../../../store/actions/networking";
import { handleWalletPaymentGetUserWallets } from "../handleWalletPaymentGetUserWallets";
import { Wallets } from "../../../../../../../definitions/pagopa/ecommerce/Wallets";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { WalletStatusEnum } from "../../../../../../../definitions/pagopa/ecommerce/WalletStatus";
import { WalletClientStatusEnum } from "../../../../../../../definitions/pagopa/ecommerce/WalletClientStatus";

describe("Test handleWalletPaymentGetUserWallets saga", () => {
  const T_SESSION_TOKEN = "ABCD";
  const getWalletsByIdUserResponse: Wallets = {
    wallets: [
      {
        walletId: "walletId",
        creationDate: new Date(),
        paymentMethodId: "paymentMethodId",
        paymentMethodAsset: "paymentMethodAsset",
        applications: [],
        clients: {
          IO: {
            status: WalletClientStatusEnum.ENABLED,
            lastUsage: new Date()
          }
        },
        status: WalletStatusEnum.VALIDATED,
        updateDate: new Date()
      }
    ]
  };

  it(`should put ${getType(
    paymentsGetPaymentUserMethodsAction.success
  )} when getWalletsByIdUser is 200`, () => {
    const mockGetWalletsByIdUser = jest.fn();

    testSaga(
      handleWalletPaymentGetUserWallets,
      mockGetWalletsByIdUser,
      paymentsGetPaymentUserMethodsAction.request({})
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 200, value: getWalletsByIdUserResponse }))
      .put(
        paymentsGetPaymentUserMethodsAction.success(getWalletsByIdUserResponse)
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    paymentsGetPaymentUserMethodsAction.failure
  )} when getWalletsByIdUser is not 200`, () => {
    const mockGetWalletsByIdUser = jest.fn();

    testSaga(
      handleWalletPaymentGetUserWallets,
      mockGetWalletsByIdUser,
      paymentsGetPaymentUserMethodsAction.request({})
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 400, value: undefined }))
      .put(
        paymentsGetPaymentUserMethodsAction.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    paymentsGetPaymentUserMethodsAction.failure
  )} when getWalletsByIdUser encoders returns an error`, () => {
    const mockGetWalletsByIdUser = jest.fn();

    testSaga(
      handleWalletPaymentGetUserWallets,
      mockGetWalletsByIdUser,
      paymentsGetPaymentUserMethodsAction.request({})
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.left([]))
      .put(
        paymentsGetPaymentUserMethodsAction.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });

  it(`should invoke onResponse if passed as attribute`, () => {
    const mockGetWalletsByIdUser = jest.fn();
    const mockOnResponse = jest.fn();

    testSaga(
      handleWalletPaymentGetUserWallets,
      mockGetWalletsByIdUser,
      paymentsGetPaymentUserMethodsAction.request({
        onResponse: mockOnResponse
      })
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 200, value: getWalletsByIdUserResponse }))
      .put(
        paymentsGetPaymentUserMethodsAction.success(getWalletsByIdUserResponse)
      )
      .next()
      .isDone();

    expect(mockOnResponse).toHaveBeenCalled();
  });
});
