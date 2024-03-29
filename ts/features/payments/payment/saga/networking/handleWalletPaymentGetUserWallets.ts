import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../../common/api/client";
import { paymentsGetPaymentUserMethodsAction } from "../../store/actions/networking";
import { getOrFetchWalletSessionToken } from "./handleWalletPaymentNewSessionToken";

export function* handleWalletPaymentGetUserWallets(
  getWalletsByIdUser: PaymentClient["getWalletsByIdUser"],
  action: ActionType<(typeof paymentsGetPaymentUserMethodsAction)["request"]>
) {
  const sessionToken = yield* getOrFetchWalletSessionToken();

  if (sessionToken === undefined) {
    yield* put(
      paymentsGetPaymentUserMethodsAction.failure({
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

    yield* put(
      pipe(
        getWalletsByIdUserResult,
        E.fold(
          error =>
            paymentsGetPaymentUserMethodsAction.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            ),
          res => {
            if (res.status === 200) {
              return paymentsGetPaymentUserMethodsAction.success(res.value);
            }
            if (res.status === 404) {
              return paymentsGetPaymentUserMethodsAction.success({
                wallets: []
              });
            }
            return paymentsGetPaymentUserMethodsAction.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(
      paymentsGetPaymentUserMethodsAction.failure({ ...getNetworkError(e) })
    );
  }
}
