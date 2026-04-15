import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletCard, WalletCardCategory, WalletCardType } from "../../types";

export const walletUpsertCard =
  createStandardAction("WALLET_UPSERT_CARD")<WalletCard>();

export const walletAddCards =
  createStandardAction("WALLET_ADD_CARDS")<ReadonlyArray<WalletCard>>();

export const walletRemoveCards = createStandardAction("WALLET_REMOVE_CARDS")<
  ReadonlyArray<WalletCard["key"]>
>();

export const walletRemoveCardsByType = createStandardAction(
  "WALLET_REMOVE_CARDS_BY_TYPE"
)<WalletCardType>();

export const walletRemoveCardsByCategory = createStandardAction(
  "WALLET_REMOVE_CARDS_BY_CATEGORY"
)<WalletCardCategory>();

export const walletHideCards =
  createStandardAction("WALLET_HIDE_CARDS")<ReadonlyArray<WalletCard["key"]>>();

export const walletRestoreCards = createStandardAction("WALLET_RESTORE_CARDS")<
  ReadonlyArray<WalletCard["key"]>
>();

export type WalletCardsActions =
  | ActionType<typeof walletUpsertCard>
  | ActionType<typeof walletAddCards>
  | ActionType<typeof walletRemoveCards>
  | ActionType<typeof walletRemoveCardsByType>
  | ActionType<typeof walletRemoveCardsByCategory>
  | ActionType<typeof walletHideCards>
  | ActionType<typeof walletRestoreCards>;
