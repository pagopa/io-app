import { put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { ActionType } from "typesafe-actions";
import {
  paymentsDeleteMethodAction,
  paymentsGetMethodDetailsAction
} from "../store/actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { WalletClient } from "../../common/api/client";
import { walletRemoveCards } from "../../../newWallet/store/actions/cards";
import { mapWalletIdToCardKey } from "../../common/utils";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";

/**
 * Handle the remote call to start Wallet onboarding payment methods list
 * @param getPaymentMethods
 * @param action
 */
export function* handleDeleteWalletDetails(
  deleteWalletById: WalletClient["deleteIOPaymentWalletById"],
  action: ActionType<(typeof paymentsDeleteMethodAction)["request"]>
) {
  try {
    const deleteWalletResult = yield* withPaymentsSessionToken(
      deleteWalletById,
      action,
      {
        walletId: action.payload.walletId
      },
      "pagoPAPlatformSessionToken"
    );

    if (E.isRight(deleteWalletResult)) {
      if (deleteWalletResult.right.status === 204) {
        yield* put(
          walletRemoveCards([mapWalletIdToCardKey(action.payload.walletId)])
        );

        // handled success
        const successAction = paymentsDeleteMethodAction.success(
          action.payload.walletId
        );
        yield* put(successAction);
        if (action.payload.onSuccess) {
          action.payload.onSuccess();
        }
        return;
      }
      if (deleteWalletResult.right.status !== 401) {
        // The 401 status is handled by the withPaymentsSessionToken
        const failureAction = paymentsDeleteMethodAction.failure({
          ...getGenericError(
            new Error(`response status code ${deleteWalletResult.right.status}`)
          )
        });
        yield* put(failureAction);
        if (action.payload.onFailure) {
          action.payload.onFailure();
        }
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
