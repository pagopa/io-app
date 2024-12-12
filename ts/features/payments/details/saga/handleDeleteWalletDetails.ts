import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { WalletClient } from "../../common/api/client";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";
import {
  paymentsDeleteMethodAction,
  paymentsGetMethodDetailsAction
} from "../store/actions";
import {
  walletHideCards,
  walletRemoveCards,
  walletRestoreCards
} from "../../../wallet/store/actions/cards";
import { mapWalletIdToCardKey } from "../../common/utils";

export function* handleDeleteWalletDetails(
  deleteWalletById: WalletClient["deleteIOPaymentWalletById"],
  action: ActionType<(typeof paymentsDeleteMethodAction)["request"]>
) {
  const walletCardKey = mapWalletIdToCardKey(action.payload.walletId);
  // Flag the card as hidden
  yield* put(walletHideCards([walletCardKey]));

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
        // handled success
        yield* put(paymentsDeleteMethodAction.success(action.payload.walletId));
        // Remove the card from the wallet
        yield* put(walletRemoveCards([walletCardKey]));
        action.payload.onSuccess?.();
        return;
      }
      if (deleteWalletResult.right.status !== 401) {
        // The 401 status is handled by the withPaymentsSessionToken
        yield* put(
          paymentsDeleteMethodAction.failure({
            ...getGenericError(
              new Error(
                `response status code ${deleteWalletResult.right.status}`
              )
            )
          })
        );
        // Restore the previously hidden card
        yield* put(walletRestoreCards([walletCardKey]));
        action.payload.onFailure?.();
      }
    } else {
      // cannot decode response
      yield* put(
        paymentsDeleteMethodAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(deleteWalletResult.left))
          )
        })
      );
      // Restore the previously hidden card
      yield* put(walletRestoreCards([walletCardKey]));
      action.payload.onFailure?.();
    }
  } catch (e) {
    yield* put(
      paymentsDeleteMethodAction.failure({
        ...getNetworkError(e)
      })
    );
    yield* put(
      paymentsGetMethodDetailsAction.failure({ ...getNetworkError(e) })
    );
    // Restore the previously hidden card
    yield* put(walletRestoreCards([walletCardKey]));
    action.payload.onFailure?.();
  }
}
