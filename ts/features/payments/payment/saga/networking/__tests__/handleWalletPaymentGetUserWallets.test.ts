import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { withRefreshApiCall } from "../../../../../fastLogin/saga/utils";
import { walletPaymentGetUserWallets } from "../../../store/actions/networking";
import { handleWalletPaymentGetUserWallets } from "../handleWalletPaymentGetUserWallets";
import { Wallets } from "../../../../../../../definitions/pagopa/ecommerce/Wallets";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { WalletStatusEnum } from "../../../../../../../definitions/pagopa/walletv3/WalletStatus";
import { selectWalletPaymentSessionToken } from "../../../store/selectors";

describe("Test handleWalletPaymentGetUserWallets saga", () => {
  const T_SESSION_TOKEN = "ABCD";

  it(`should put ${getType(
    walletPaymentGetUserWallets.success
  )} when getWalletsByIdUser is 200`, () => {
    const mockGetWalletsByIdUser = jest.fn();
    const getWalletsByIdUserResponse: Wallets = {
      wallets: [
        {
          walletId: "walletId",
          creationDate: new Date(),
          paymentMethodId: "paymentMethodId",
          paymentMethodAsset: "paymentMethodAsset",
          services: [],
          status: WalletStatusEnum.CREATED,
          updateDate: new Date()
        }
      ]
    };

    testSaga(
      handleWalletPaymentGetUserWallets,
      mockGetWalletsByIdUser,
      walletPaymentGetUserWallets.request()
    )
      .next()
      .select(selectWalletPaymentSessionToken)
      .next(T_SESSION_TOKEN)
      .call(
        withRefreshApiCall,
        mockGetWalletsByIdUser(),
        walletPaymentGetUserWallets.request()
      )
      .next(E.right({ status: 200, value: getWalletsByIdUserResponse }))
      .put(walletPaymentGetUserWallets.success(getWalletsByIdUserResponse))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentGetUserWallets.failure
  )} when getWalletsByIdUser is not 200`, () => {
    const mockGetWalletsByIdUser = jest.fn();

    testSaga(
      handleWalletPaymentGetUserWallets,
      mockGetWalletsByIdUser,
      walletPaymentGetUserWallets.request()
    )
      .next()
      .select(selectWalletPaymentSessionToken)
      .next(T_SESSION_TOKEN)
      .call(
        withRefreshApiCall,
        mockGetWalletsByIdUser(),
        walletPaymentGetUserWallets.request()
      )
      .next(E.right({ status: 400, value: undefined }))
      .put(
        walletPaymentGetUserWallets.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentGetUserWallets.failure
  )} when getWalletsByIdUser encoders returns an error`, () => {
    const mockGetWalletsByIdUser = jest.fn();

    testSaga(
      handleWalletPaymentGetUserWallets,
      mockGetWalletsByIdUser,
      walletPaymentGetUserWallets.request()
    )
      .next()
      .select(selectWalletPaymentSessionToken)
      .next(T_SESSION_TOKEN)
      .call(
        withRefreshApiCall,
        mockGetWalletsByIdUser(),
        walletPaymentGetUserWallets.request()
      )
      .next(E.left([]))
      .put(
        walletPaymentGetUserWallets.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
