import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

import { Option } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { CreditCard, Wallet } from "../../../types/pagopa";

export type WalletsActions =
  | ActionType<typeof fetchWalletsRequest>
  | ActionType<typeof fetchWalletsSuccess>
  | ActionType<typeof setFavoriteWallet>
  | ActionType<typeof storeCreditCardData>
  | ActionType<typeof creditCardDataCleanup>
  | ActionType<typeof addCreditCardRequest>
  | ActionType<typeof addCreditCardCompleted>
  | ActionType<typeof deleteWalletRequest>
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

export const setFavoriteWallet = createStandardAction("SET_FAVORITE_WALLET")<
  number | undefined
>();

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
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    paymentId: string;
  }>;
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
