import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";

const selectPaymentsWallet = (state: GlobalState) =>
  state.features.payments.wallet;

export const paymentsWalletUserMethodsSelector = createSelector(
  selectPaymentsWallet,
  wallet =>
    pot.map(
      wallet.userMethods,
      ({ wallets }) => wallets || ([] as ReadonlyArray<WalletInfo>)
    )
);
