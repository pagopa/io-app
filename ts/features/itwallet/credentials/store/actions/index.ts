import { ActionType, createStandardAction } from "typesafe-actions";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";

export const itwCredentialsStore = createStandardAction(
  "ITW_CREDENTIALS_STORE"
)<StoredCredential>();

export const itwCredentialsRemove = createStandardAction(
  "ITW_CREDENTIALS_REMOVE"
)<StoredCredential>();

export const itwCredentialsWalletReset = createStandardAction(
  "ITW_CREDENTIALS_WALLET_RESET"
)<void>();

export type ItwCredentialsActions = ActionType<
  | typeof itwCredentialsStore
  | typeof itwCredentialsRemove
  | typeof itwCredentialsWalletReset
>;
