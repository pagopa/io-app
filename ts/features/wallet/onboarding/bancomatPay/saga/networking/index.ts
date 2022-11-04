import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { RestBPayResponse } from "../../../../../../../definitions/pagopa/walletv2/RestBPayResponse";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import {
  PatchedWalletV2ListResponse,
  PaymentManagerToken
} from "../../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { fromPatchedWalletV2ToRawBPay } from "../../../../../../utils/walletv2";
import {
  addBPayToWallet as addBpayToWalletAction,
  searchUserBPay
} from "../../store/actions";

/**
 * Load all the user BPay accounts
 */
export function* handleSearchUserBPay(
  searchBPay: ReturnType<typeof PaymentManagerClient>["searchBPay"],
  sessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof searchUserBPay.request>
) {
  try {
    const searchBPayWithRefresh = sessionManager.withRefresh(
      searchBPay(action.payload)
    );

    const searchBPayWithRefreshResult: SagaCallReturnType<
      typeof searchBPayWithRefresh
    > = yield* call(searchBPayWithRefresh);
    if (E.isRight(searchBPayWithRefreshResult)) {
      const statusCode = searchBPayWithRefreshResult.right.status;
      if (statusCode === 200) {
        const payload: RestBPayResponse =
          searchBPayWithRefreshResult.right.value;
        const bPayList = payload.data ?? [];
        return yield* put(searchUserBPay.success(bPayList));
      } else if (statusCode === 404) {
        // the user doesn't own any bpay
        return yield* put(searchUserBPay.success([]));
      } else {
        return yield* put(
          searchUserBPay.failure(
            getGenericError(
              new Error(
                `response status ${searchBPayWithRefreshResult.right.status}`
              )
            )
          )
        );
      }
    } else {
      return yield* put(
        searchUserBPay.failure(
          getGenericError(
            new Error(readablePrivacyReport(searchBPayWithRefreshResult.left))
          )
        )
      );
    }
  } catch (e) {
    return yield* put(searchUserBPay.failure(getNetworkError(e)));
  }
}

/**
 * Add user BPay account to wallet
 */
export function* handleAddpayToWallet(
  addBPayToWallet: ReturnType<typeof PaymentManagerClient>["addBPayToWallet"],
  sessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof addBpayToWalletAction.request>
) {
  try {
    const addBPayToWalletWithRefresh = sessionManager.withRefresh(
      addBPayToWallet({ data: [action.payload] })
    );

    const addBPayToWalletWithRefreshResult: SagaCallReturnType<
      typeof addBPayToWalletWithRefresh
    > = yield* call(addBPayToWalletWithRefresh);
    if (E.isRight(addBPayToWalletWithRefreshResult)) {
      const statusCode = addBPayToWalletWithRefreshResult.right.status;
      if (statusCode === 200) {
        const payload: PatchedWalletV2ListResponse =
          addBPayToWalletWithRefreshResult.right.value;
        // search for the added bpay
        const maybeAddedBPay = (payload.data ?? [])
          .map(fromPatchedWalletV2ToRawBPay)
          .find(w =>
            pipe(
              w,
              O.map(bp => bp.info.uidHash === action.payload.uidHash),
              O.getOrElse(() => false)
            )
          );
        if (maybeAddedBPay && O.isSome(maybeAddedBPay)) {
          return yield* put(
            addBpayToWalletAction.success(maybeAddedBPay.value)
          );
        } else {
          return yield* put(
            addBpayToWalletAction.failure(
              getGenericError(
                new Error(`cannot find added bpay in wallets list response`)
              )
            )
          );
        }
      } else {
        return yield* put(
          addBpayToWalletAction.failure(
            getGenericError(
              new Error(
                `response status ${addBPayToWalletWithRefreshResult.right.status}`
              )
            )
          )
        );
      }
    } else {
      return yield* put(
        addBpayToWalletAction.failure(
          getGenericError(
            new Error(
              readablePrivacyReport(addBPayToWalletWithRefreshResult.left)
            )
          )
        )
      );
    }
  } catch (e) {
    return yield* put(addBpayToWalletAction.failure(getNetworkError(e)));
  }
}
