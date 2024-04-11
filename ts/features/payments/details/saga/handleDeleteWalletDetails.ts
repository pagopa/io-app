import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import {
  paymentsDeleteMethodAction,
  paymentsGetMethodDetailsAction
} from "../store/actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { WalletClient } from "../../common/api/client";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { walletRemoveCards } from "../../../newWallet/store/actions/cards";
import { mapWalletIdToCardKey } from "../../common/utils/wallet";

/**
 * Handle the remote call to start Wallet onboarding payment methods list
 * @param getPaymentMethods
 * @param action
 */
export function* handleDeleteWalletDetails(
  deleteWalletById: WalletClient["deleteWalletById"],
  action: ActionType<(typeof paymentsDeleteMethodAction)["request"]>
) {
  try {
    const deleteWalletRequest = deleteWalletById({
      walletId: action.payload.walletId
    });
    const deleteWalletResult = (yield* call(
      withRefreshApiCall,
      deleteWalletRequest,
      action
    )) as unknown as SagaCallReturnType<typeof deleteWalletById>;
    if (E.isRight(deleteWalletResult)) {
      if (deleteWalletResult.right.status === 204) {
        yield* put(
          walletRemoveCards([mapWalletIdToCardKey(action.payload.walletId)])
        );

        // handled success
        const successAction = paymentsDeleteMethodAction.success();
        yield* put(successAction);
        if (action.payload.onSuccess) {
          action.payload.onSuccess();
        }
        return;
      }
      // not handled error codes
      const failureAction = paymentsDeleteMethodAction.failure({
        ...getGenericError(
          new Error(`response status code ${deleteWalletResult.right.status}`)
        )
      });
      yield* put(failureAction);
      if (action.payload.onFailure) {
        action.payload.onFailure();
      }
    } else {
      // cannot decode response
      const failureAction = paymentsDeleteMethodAction.failure({
        ...getGenericError(
          new Error(readablePrivacyReport(deleteWalletResult.left))
        )
      });
      yield* put(failureAction);
      if (action.payload.onFailure) {
        action.payload.onFailure();
      }
    }
  } catch (e) {
    yield* put(
      paymentsGetMethodDetailsAction.failure({ ...getNetworkError(e) })
    );
  }
}
