import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { ActionType } from "typesafe-actions";
import { fromNullable } from "fp-ts/lib/Option";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { SessionManager } from "../../../../../../utils/SessionManager";
import {
  PatchedWalletV2ListResponse,
  PaymentManagerToken
} from "../../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getNetworkError } from "../../../../../../utils/errors";
import { RestBPayResponse } from "../../../../../../../definitions/pagopa/walletv2/RestBPayResponse";
import {
  searchUserBPay,
  addBPayToWallet as addBpayToWalletAction
} from "../../store/actions";
import { fromPatchedWalletV2ToRawBPay } from "../../../../../../utils/walletv2";
import { isDefined } from "../../../../../../utils/guards";

/**
 * search for user's bpay
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

    const searchBPayWithRefreshResult: SagaCallReturnType<typeof searchBPayWithRefresh> = yield call(
      searchBPayWithRefresh
    );
    if (searchBPayWithRefreshResult.isRight()) {
      const statusCode = searchBPayWithRefreshResult.value.status;
      if (statusCode === 200) {
        const payload: RestBPayResponse =
          searchBPayWithRefreshResult.value.value;
        const bPayList = payload.data ?? [];
        return yield put(searchUserBPay.success(bPayList));
      } else if (statusCode === 404) {
        // the user doesn't own any bpay
        return yield put(searchUserBPay.success([]));
      } else {
        return yield put(
          searchUserBPay.failure({
            kind: "generic",
            value: new Error(
              `response status ${searchBPayWithRefreshResult.value.status}`
            )
          })
        );
      }
    } else {
      return yield put(
        searchUserBPay.failure({
          kind: "generic",
          value: new Error(readableReport(searchBPayWithRefreshResult.value))
        })
      );
    }
  } catch (e) {
    return yield put(searchUserBPay.failure(getNetworkError(e)));
  }
}

/**
 * search for user's bpay
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

    const addBPayToWalletWithRefreshResult: SagaCallReturnType<typeof addBPayToWalletWithRefresh> = yield call(
      addBPayToWalletWithRefresh
    );
    if (addBPayToWalletWithRefreshResult.isRight()) {
      const statusCode = addBPayToWalletWithRefreshResult.value.status;
      if (statusCode === 200) {
        const payload: PatchedWalletV2ListResponse =
          addBPayToWalletWithRefreshResult.value.value;
        // search for the added bpay
        const maybeAddedBPay = fromNullable(
          (payload.data ?? [])
            .map(w => fromPatchedWalletV2ToRawBPay(w))
            .filter(isDefined)
            .find(bp => bp.info.uidHash === action.payload.uidHash)
        );
        if (maybeAddedBPay.isSome()) {
          return yield put(addBpayToWalletAction.success(maybeAddedBPay.value));
        } else {
          throw new Error(`cannot find added bpay in wallets list response`);
        }
      } else {
        return yield put(
          addBpayToWalletAction.failure({
            kind: "generic",
            value: new Error(
              `response status ${addBPayToWalletWithRefreshResult.value.status}`
            )
          })
        );
      }
    } else {
      return yield put(
        addBpayToWalletAction.failure({
          kind: "generic",
          value: new Error(
            readableReport(addBPayToWalletWithRefreshResult.value)
          )
        })
      );
    }
  } catch (e) {
    return yield put(addBpayToWalletAction.failure(getNetworkError(e)));
  }
}
