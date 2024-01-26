import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { WalletClient } from "../../../common/api/client";
import { walletPaymentGetUserWallets } from "../../store/actions/networking";

export function* handleWalletPaymentGetUserWallets(
  getWalletsByIdUser: WalletClient["getWalletsByIdUser"],
  action: ActionType<(typeof walletPaymentGetUserWallets)["request"]>
) {
  const getWalletsByIdUserRequest = getWalletsByIdUser({});

  try {
    const getWalletsByIdUserResult = (yield* call(
      withRefreshApiCall,
      getWalletsByIdUserRequest,
      action
    )) as SagaCallReturnType<typeof getWalletsByIdUser>;

    yield* put(
      pipe(
        getWalletsByIdUserResult,
        E.fold(
          error =>
            walletPaymentGetUserWallets.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            ),
          res => {
            if (res.status === 200) {
              return walletPaymentGetUserWallets.success(res.value);
            }
            return walletPaymentGetUserWallets.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(walletPaymentGetUserWallets.failure({ ...getNetworkError(e) }));
  }
}
