import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { withRefreshApiCall } from "../../../../../fastLogin/saga/utils";
import { paymentsGetPaymentUserMethodsAction } from "../../../store/actions/networking";
import { handleWalletPaymentGetUserWallets } from "../handleWalletPaymentGetUserWallets";
import { Wallets } from "../../../../../../../definitions/pagopa/ecommerce/Wallets";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { WalletStatusEnum } from "../../../../../../../definitions/pagopa/ecommerce/WalletStatus";
import { selectWalletPaymentSessionToken } from "../../../store/selectors";

describe("Test handleWalletPaymentGetUserWallets saga", () => {
  const T_SESSION_TOKEN = "ABCD";

  it(`should put ${getType(
    paymentsGetPaymentUserMethodsAction.success
  )} when getWalletsByIdUser is 200`, () => {
    const mockGetWalletsByIdUser = jest.fn();
    const getWalletsByIdUserResponse: Wallets = {
      wallets: [
        {
          walletId: "walletId",
          creationDate: new Date(),
          paymentMethodId: "paymentMethodId",
          paymentMethodAsset: "paymentMethodAsset",
          applications: [],
          status: WalletStatusEnum.VALIDATED,
          updateDate: new Date()
        }
      ]
    };

    testSaga(
      handleWalletPaymentGetUserWallets,
      mockGetWalletsByIdUser,
      paymentsGetPaymentUserMethodsAction.request()
    )
      .next()
      .select(selectWalletPaymentSessionToken)
      .next(T_SESSION_TOKEN)
      .call(
        withRefreshApiCall,
        mockGetWalletsByIdUser(),
        paymentsGetPaymentUserMethodsAction.request()
      )
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
      paymentsGetPaymentUserMethodsAction.request()
    )
      .next()
      .select(selectWalletPaymentSessionToken)
      .next(T_SESSION_TOKEN)
      .call(
        withRefreshApiCall,
        mockGetWalletsByIdUser(),
        paymentsGetPaymentUserMethodsAction.request()
      )
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
      paymentsGetPaymentUserMethodsAction.request()
    )
      .next()
      .select(selectWalletPaymentSessionToken)
      .next(T_SESSION_TOKEN)
      .call(
        withRefreshApiCall,
        mockGetWalletsByIdUser(),
        paymentsGetPaymentUserMethodsAction.request()
      )
      .next(E.left([]))
      .put(
        paymentsGetPaymentUserMethodsAction.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
