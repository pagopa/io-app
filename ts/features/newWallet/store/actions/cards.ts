import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletCard } from "../../types";

export const walletUpsertCard =
  createStandardAction("WALLET_UPSERT_CARD")<WalletCard>();

export const walletAddCards =
  createStandardAction("WALLET_ADD_CARDS")<ReadonlyArray<WalletCard>>();

export const walletRemoveCard =
  createStandardAction("WALLET_REMOVE_CARD")<WalletCard["key"]>();

export const walletRemoveCards = createStandardAction("WALLET_REMOVE_CARDS")<
  ReadonlyArray<WalletCard["key"]>
>();

export type WalletCardsActions =
  | ActionType<typeof walletUpsertCard>
  | ActionType<typeof walletAddCards>
  | ActionType<typeof walletRemoveCard>
  | ActionType<typeof walletRemoveCards>;
