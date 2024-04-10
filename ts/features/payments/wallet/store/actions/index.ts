import { ActionType, createAsyncAction } from "typesafe-actions";
import { Wallets } from "../../../../../../definitions/pagopa/walletv3/Wallets";
import { NetworkError } from "../../../../../utils/errors";

export const getPaymentsWalletUserMethods = createAsyncAction(
  "PAYMENTS_WALLET_GET_USER_METHODS_REQUEST",
  "PAYMENTS_WALLET_GET_USER_METHODS_SUCCESS",
  "PAYMENTS_WALLET_GET_USER_METHODS_FAILURE"
)<void, Wallets, NetworkError>();

export type PaymentsWalletActions = ActionType<
  typeof getPaymentsWalletUserMethods
>;
