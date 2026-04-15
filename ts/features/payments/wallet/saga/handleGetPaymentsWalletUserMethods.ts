import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { walletAddCards } from "../../../wallet/store/actions/cards";
import { WalletClient } from "../../common/api/client";
import { mapWalletsToCards } from "../../common/utils";
import { getPaymentsWalletUserMethods } from "../store/actions";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";
import { handleRemoveMissingCards } from "../../../wallet/saga/handleRemoveMissingCards";

export function* handleGetPaymentsWalletUserMethods(
  getWalletsByIdUser: WalletClient["getIOPaymentWalletsByIdUser"],
  action: ActionType<(typeof getPaymentsWalletUserMethods)["request"]>
) {
  try {
    const getWalletsByIdUserResult = yield* withPaymentsSessionToken(
      getWalletsByIdUser,
      action,
      {},
      "pagoPAPlatformSessionToken"
    );

    yield* pipe(
      getWalletsByIdUserResult,
      E.fold(
        function* (error) {
          yield* put(
            getPaymentsWalletUserMethods.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
        },
        function* (res) {
          if (res.status === 200) {
            const wallets = res.value?.wallets || [];
            const cards = mapWalletsToCards(wallets);
            yield* put(walletAddCards(cards));

            // Create set of keys from latest API response and remove stored cards
            const newKeys = new Set(cards.map(card => card.key));
            yield* handleRemoveMissingCards(newKeys, "payment");

            yield* put(getPaymentsWalletUserMethods.success(res.value));
          } else if (res.status === 404) {
            yield* put(getPaymentsWalletUserMethods.success({ wallets: [] }));
          } else if (res.status !== 401) {
            // The 401 is handled by the withPaymentsSessionToken
            yield* put(
              getPaymentsWalletUserMethods.failure({
                ...getGenericError(new Error(`Error: ${res.status}`))
              })
            );
          }
        }
      )
    );
  } catch (e) {
    yield* put(getPaymentsWalletUserMethods.failure({ ...getNetworkError(e) }));
  }
}
