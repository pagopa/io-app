import { Option } from "fp-ts/lib/Option";
import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

import { CreditCard, Wallet } from "../../../types/pagopa";

export type WalletsActions =
  | ActionType<typeof fetchWalletsRequest>
  | ActionType<typeof fetchWalletsSuccess>
  | ActionType<typeof selectWalletForDetails>
  | ActionType<typeof setFavoriteWallet>
  | ActionType<typeof storeCreditCardData>
  | ActionType<typeof creditCardDataCleanup>
  | ActionType<typeof addCreditCardRequest>
  | ActionType<typeof addCreditCardCompleted>
  | ActionType<typeof deleteWalletRequest>
  | ActionType<typeof walletManagementSetLoadingState>
  | ActionType<typeof walletManagementResetLoadingState>
  | ActionType<typeof fetchWalletsFailure>;

export const fetchWalletsRequest = createStandardAction(
  "FETCH_WALLETS_REQUEST"
)();

export const fetchWalletsSuccess = createAction(
  "FETCH_WALLETS_SUCCESS",
  resolve => (wallets: ReadonlyArray<Wallet>) => resolve(wallets)
);

export const fetchWalletsFailure = createAction(
  "FETCH_WALLETS_FAILURE",
  resolve => (error: Error) => resolve(error)
);

export const selectWalletForDetails = createStandardAction(
  "SELECT_WALLET_FOR_DETAILS"
)<number>();

export const setFavoriteWallet = createAction(
  "SET_FAVORITE_WALLET",
  resolve => (walletId: Option<number>) => resolve(walletId)
);

export const storeCreditCardData = createAction(
  "STORE_CREDIT_CARD_DATA",
  resolve => (card: CreditCard) => resolve(card)
);

export const creditCardDataCleanup = createStandardAction(
  "CREDIT_CARD_DATA_CLEANUP"
)();

type AddCreditCardRequestPayload = Readonly<{
  creditCard: CreditCard;
  setAsFavorite: boolean;
}>;

export const addCreditCardRequest = createStandardAction(
  "ADD_CREDIT_CARD_REQUEST"
)<AddCreditCardRequestPayload>();

export const addCreditCardCompleted = createStandardAction(
  "ADD_CREDIT_CARD_COMPLETED"
)();

export const deleteWalletRequest = createAction(
  "DELETE_WALLET_REQUEST",
  resolve => (walletId: number) => resolve(walletId)
);

export const walletManagementSetLoadingState = createStandardAction(
  "WALLET_MANAGEMENT_SET_LOADING_STATE"
)();

export const walletManagementResetLoadingState = createStandardAction(
  "WALLET_MANAGEMENT_RESET_LOADING_STATE"
)();
