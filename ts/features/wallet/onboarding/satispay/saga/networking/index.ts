import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import _ from "lodash";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getError,
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { fromPatchedWalletV2ToRawSatispay } from "../../../../../../utils/walletv2";
import { addSatispayToWallet, searchUserSatispay } from "../../store/actions";

/**
 * search for user's satispay
 */
export function* handleSearchUserSatispay(
  searchSatispay: ReturnType<typeof PaymentManagerClient>["searchSatispay"],
  sessionManager: SessionManager<PaymentManagerToken>
) {
  try {
    const searchSatispayWithRefresh = sessionManager.withRefresh(
      searchSatispay("" as PaymentManagerToken)
    );

    const searchSatispayWithRefreshResult: SagaCallReturnType<
      typeof searchSatispayWithRefresh
    > = yield* call(searchSatispayWithRefresh);
    if (E.isRight(searchSatispayWithRefreshResult)) {
      const statusCode = searchSatispayWithRefreshResult.right.status;
      if (statusCode === 200) {
        const value = searchSatispayWithRefreshResult.right.value;
        // even if the user doesn't own satispay the response is 200 but the payload is empty
        // FIXME 200 must always contain a non-empty payload
        return yield* put(
          searchUserSatispay.success(
            !value.data || _.isEmpty(value.data) ? null : value.data
          )
        );
      } else if (statusCode === 404) {
        // the user doesn't own any satispay
        return yield* put(searchUserSatispay.success(null));
      } else {
        return yield* put(
          searchUserSatispay.failure({
            kind: "generic",
            value: new Error(
              `response status ${searchSatispayWithRefreshResult.right.status}`
            )
          })
        );
      }
    } else {
      return yield* put(
        searchUserSatispay.failure(
          getGenericError(
            new Error(
              readablePrivacyReport(searchSatispayWithRefreshResult.left)
            )
          )
        )
      );
    }
  } catch (e) {
    return yield* put(searchUserSatispay.failure(getNetworkError(e)));
  }
}

/**
 * add the user's satispay to the wallet
 */
export function* handleAddUserSatispayToWallet(
  addSatispayToWalletClient: ReturnType<
    typeof PaymentManagerClient
  >["addSatispayToWallet"],
  sessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof addSatispayToWallet.request>
) {
  try {
    const addSatispayToWalletWithRefresh = sessionManager.withRefresh(
      addSatispayToWalletClient({ data: action.payload })
    );

    const addSatispayToWalletWithRefreshResult: SagaCallReturnType<
      typeof addSatispayToWalletWithRefresh
    > = yield* call(addSatispayToWalletWithRefresh);
    if (E.isRight(addSatispayToWalletWithRefreshResult)) {
      const statusCode = addSatispayToWalletWithRefreshResult.right.status;
      const wallet = addSatispayToWalletWithRefreshResult.right.value.data;
      if (statusCode === 200) {
        const newSatispay = wallet
          ? fromPatchedWalletV2ToRawSatispay(wallet)
          : undefined;
        if (newSatispay) {
          // satispay has been added to the user wallet
          return yield* put(addSatispayToWallet.success(newSatispay));
        } else {
          return yield* put(
            addSatispayToWallet.failure(
              new Error(`cannot transform in RawSatispayPaymentMethod`)
            )
          );
        }
      } else {
        return yield* put(
          addSatispayToWallet.failure(
            new Error(`response status ${statusCode}`)
          )
        );
      }
    } else {
      return yield* put(
        addSatispayToWallet.failure(
          new Error(readableReport(addSatispayToWalletWithRefreshResult.left))
        )
      );
    }
  } catch (e) {
    return yield* put(addSatispayToWallet.failure(getError(e)));
  }
}
