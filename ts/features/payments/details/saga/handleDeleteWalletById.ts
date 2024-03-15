import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { WalletClient } from "../../common/api/client";
import {
  walletDetailsDeleteInstrument,
  walletDetailsGetInstrument
} from "../store/actions";

/**
 * Handle the remote call to start Wallet onboarding payment methods list
 * @param getPaymentMethods
 * @param action
 */
export function* handleDeleteWalletById(
  deleteWalletById: WalletClient["deleteWalletById"],
  action: ActionType<(typeof walletDetailsDeleteInstrument)["request"]>
) {
  try {
    const deleteWalletRequest = deleteWalletById({
      walletId: action.payload.walletId
    });
    const deleteWalletResult = (yield* call(
      withRefreshApiCall,
      deleteWalletRequest,
      action
    )) as SagaCallReturnType<typeof deleteWalletById>;

    yield* pipe(
      deleteWalletResult,
      E.fold(
        function* (error) {
          yield* put(
            walletDetailsDeleteInstrument.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
          action.payload.onFailure?.();
        },
        function* ({ status }) {
          switch (status) {
            case 204:
              yield* put(walletDetailsDeleteInstrument.success());
              action.payload.onSuccess?.();
              break;
            default:
              yield* put(
                walletDetailsDeleteInstrument.failure(
                  getGenericError(new Error(`response status code ${status}`))
                )
              );
              action.payload.onFailure?.();
          }
        }
      )
    );
  } catch (e) {
    yield* put(walletDetailsGetInstrument.failure({ ...getNetworkError(e) }));
  }
}
