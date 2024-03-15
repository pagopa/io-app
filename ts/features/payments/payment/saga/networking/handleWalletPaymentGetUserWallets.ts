import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentGetUserWallets } from "../../store/actions/networking";
import { getOrFetchWalletSessionToken } from "./handleWalletPaymentNewSessionToken";

export function* handleWalletPaymentGetUserWallets(
  getWalletsByIdUser: PaymentClient["getWalletsByIdUser"],
  action: ActionType<(typeof walletPaymentGetUserWallets)["request"]>
) {
  const sessionToken = yield* getOrFetchWalletSessionToken();

  if (sessionToken === undefined) {
    yield* put(
      walletPaymentGetUserWallets.failure({
        ...getGenericError(new Error(`Missing session token`))
      })
    );
    return;
  }

  const getWalletsByIdUserRequest = getWalletsByIdUser({
    eCommerceSessionToken: sessionToken
  });

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
            walletPaymentGetUserWallets.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
        },
        function* ({ status, value }) {
          switch (status) {
            case 200:
              yield* put(walletPaymentGetUserWallets.success(value));
              break;
            case 404:
              // 404 status code means we do not have any payment method to show
              yield* put(walletPaymentGetUserWallets.success({ wallets: [] }));
              break;
            default:
              yield* put(
                walletPaymentGetUserWallets.failure(
                  getGenericError(new Error(`Error: ${status}`))
                )
              );
          }
        }
      )
    );
  } catch (e) {
    yield* put(walletPaymentGetUserWallets.failure({ ...getNetworkError(e) }));
  }
}
