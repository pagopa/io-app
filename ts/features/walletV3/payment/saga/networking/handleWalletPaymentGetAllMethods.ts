import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentGetAllMethods } from "../../store/actions/networking";
import { getOrFetchWalletSessionToken } from "./handleWalletPaymentNewSessionToken";

export function* handleWalletPaymentGetAllMethods(
  getAllPaymentMethods: PaymentClient["getAllPaymentMethods"],
  action: ActionType<(typeof walletPaymentGetAllMethods)["request"]>
) {
  const sessionToken = yield* getOrFetchWalletSessionToken();

  if (sessionToken === undefined) {
    yield* put(
      walletPaymentGetAllMethods.failure({
        ...getGenericError(new Error(`Missing session token`))
      })
    );
    return;
  }

  const getAllPaymentMethodsRequest = getAllPaymentMethods({
    eCommerceSessionToken: sessionToken
  });

  try {
    const getAllPaymentMethodsResult = (yield* call(
      withRefreshApiCall,
      getAllPaymentMethodsRequest,
      action
    )) as SagaCallReturnType<typeof getAllPaymentMethods>;

    yield* put(
      pipe(
        getAllPaymentMethodsResult,
        E.fold(
          error =>
            walletPaymentGetAllMethods.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),

          res => {
            if (res.status === 200) {
              return walletPaymentGetAllMethods.success(res.value);
            }
            return walletPaymentGetAllMethods.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(walletPaymentGetAllMethods.failure({ ...getNetworkError(e) }));
  }
}
