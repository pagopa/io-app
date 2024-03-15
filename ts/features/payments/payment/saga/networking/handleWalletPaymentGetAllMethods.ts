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

    yield* pipe(
      getAllPaymentMethodsResult,
      E.fold(
        function* (error) {
          yield* put(
            walletPaymentGetAllMethods.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
        },
        function* ({ status, value }) {
          switch (status) {
            case 200:
              yield* put(walletPaymentGetAllMethods.success(value));
              break;
            default:
              yield* put(
                walletPaymentGetAllMethods.failure(
                  getGenericError(new Error(`Error: ${status}`))
                )
              );
          }
        }
      )
    );
  } catch (e) {
    yield* put(walletPaymentGetAllMethods.failure({ ...getNetworkError(e) }));
  }
}
