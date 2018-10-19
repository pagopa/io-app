import { ActionType, createStandardAction } from "typesafe-actions";

import { Option } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { CreditCard, Wallet } from "../../../types/pagopa";

export const fetchWalletsRequest = createStandardAction(
  "FETCH_WALLETS_REQUEST"
)();

export const fetchWalletsSuccess = createStandardAction(
  "FETCH_WALLETS_SUCCESS"
)<ReadonlyArray<Wallet>>();

export const fetchWalletsFailure = createStandardAction(
  "FETCH_WALLETS_FAILURE"
)<Error>();

type DeleteWalletRequestPayload = Readonly<{
  walletId: number;
  onSuccess?: (action: ActionType<typeof deleteWalletSuccess>) => void;
  onFailure?: (action: ActionType<typeof deleteWalletFailure>) => void;
}>;

export const deleteWalletRequest = createStandardAction(
  "DELETE_WALLET_REQUEST"
)<DeleteWalletRequestPayload>();

export const deleteWalletSuccess = createStandardAction(
  "DELETE_WALLET_SUCCESS"
)<ReadonlyArray<Wallet>>();

export const deleteWalletFailure = createStandardAction(
  "DELETE_WALLET_FAILURE"
)<Error>();

export const setFavoriteWallet = createStandardAction("SET_FAVORITE_WALLET")<
  number | undefined
>();

export const creditCardDataCleanup = createStandardAction(
  "CREDIT_CARD_DATA_CLEANUP"
)();

type AddCreditCardRequestPayload = Readonly<{
  creditCard: CreditCard;
  setAsFavorite: boolean;
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    paymentId: string;
  }>;
}>;

export const runAddCreditCardSaga = createStandardAction(
  "RUN_ADD_CREDIT_CARD_SAGA"
)<AddCreditCardRequestPayload>();

export const addCreditCardCompleted = createStandardAction(
  "ADD_CREDIT_CARD_COMPLETED"
)();

export type WalletsActions =
  | ActionType<typeof fetchWalletsRequest>
  | ActionType<typeof fetchWalletsSuccess>
  | ActionType<typeof fetchWalletsFailure>
  | ActionType<typeof deleteWalletRequest>
  | ActionType<typeof deleteWalletSuccess>
  | ActionType<typeof deleteWalletFailure>
  | ActionType<typeof setFavoriteWallet>
  | ActionType<typeof creditCardDataCleanup>
  | ActionType<typeof runAddCreditCardSaga>
  | ActionType<typeof addCreditCardCompleted>;
