import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { walletAddCards } from "../../../newWallet/store/actions/cards";
import { WalletCard } from "../../../newWallet/types";
import { WalletClient } from "../../common/api/client";
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import { getPaymentsWalletUserMethods } from "../store/actions";

const mapWalletsToCards = (
  wallets: ReadonlyArray<WalletInfo>
): ReadonlyArray<WalletCard> =>
  wallets.map<WalletCard>(wallet => {
    const details = wallet.details as UIWalletInfoDetails;

    return {
      key: `method_${wallet.walletId}`,
      type: "payment",
      category: "payment",
      walletId: wallet.walletId,
      hpan: details.lastFourDigits,
      abiCode: details.abi,
      brand: details.brand,
      expireDate: details.expiryDate,
      holderEmail: details.maskedEmail,
      holderPhone: details.maskedNumber
    };
  });

export function* handleGetPaymentsWalletUserMethods(
  getWalletsByIdUser: WalletClient["getWalletsByIdUser"],
  action: ActionType<(typeof getPaymentsWalletUserMethods)["request"]>
) {
  const getWalletsByIdUserRequest = getWalletsByIdUser({});

  try {
    const getWalletsByIdUserResult = (yield* call(
      withRefreshApiCall,
      getWalletsByIdUserRequest,
      action
    )) as SagaCallReturnType<typeof getWalletsByIdUser>;

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
            yield* put(
              walletAddCards(mapWalletsToCards(res.value?.wallets || []))
            );
            yield* put(getPaymentsWalletUserMethods.success(res.value));
          } else if (res.status === 404) {
            yield* put(getPaymentsWalletUserMethods.success({ wallets: [] }));
          } else {
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
