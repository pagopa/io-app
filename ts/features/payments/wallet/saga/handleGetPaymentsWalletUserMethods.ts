import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { walletAddCards } from "../../../newWallet/store/actions/cards";
import { WalletClient } from "../../common/api/client";
import { mapWalletsToCards } from "../../common/utils";
import { getPaymentsWalletUserMethods } from "../store/actions";

export function* handleGetPaymentsWalletUserMethods(
  getWalletsByIdUser: WalletClient["getWalletsByIdUser"],
  action: ActionType<(typeof getPaymentsWalletUserMethods)["request"]>
) {
  const getWalletsByIdUserRequest = getWalletsByIdUser({});

  try {
    const getWalletsByIdUserResult = (yield* call(
      withRefreshApiCall,
      getWalletsByIdUserRequest,
      action
    )) as SagaCallReturnType<typeof getWalletsByIdUser>;

    yield* pipe(
      getWalletsByIdUserResult,
      E.fold(
        function* (error) {
          yield* put(
            getPaymentsWalletUserMethods.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
        },
        function* (res) {
          if (res.status === 200) {
            yield* put(
              walletAddCards(mapWalletsToCards(res.value?.wallets || []))
            );
            yield* put(getPaymentsWalletUserMethods.success(res.value));
          } else if (res.status === 404) {
            yield* put(getPaymentsWalletUserMethods.success({ wallets: [] }));
          } else if (res.status !== 401) {
            // The 401 status is handled by the withRefreshApiCall
            yield* put(
              getPaymentsWalletUserMethods.failure({
                ...getGenericError(new Error(`Error: ${res.status}`))
              })
            );
          }
        }
      )
    );
  } catch (e) {
    yield* put(getPaymentsWalletUserMethods.failure({ ...getNetworkError(e) }));
  }
}
