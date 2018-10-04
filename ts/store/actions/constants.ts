/**
 * All the actions related constants.
 */

// Wallet

// (payment)
export const PAYMENT_REQUEST_TRANSACTION_SUMMARY: "PAYMENT_REQUEST_TRANSACTION_SUMMARY" =
  "PAYMENT_REQUEST_TRANSACTION_SUMMARY";
// TODO: temporary, until integration with pagoPA occurs @https://www.pivotaltracker.com/story/show/159494746
export const PAYMENT_UPDATE_PSP_IN_STATE: "PAYMENT_UPDATE_PSP_IN_STATE" =
  "PAYMENT_UPDATE_PSP_IN_STATE";

// Error
export const ERROR_CLEAR: "ERROR_CLEAR" = "ERROR_CLEAR";

// Enum for actions that need UI state reducers
export const enum FetchRequestActions {
  TOS_ACCEPT = "TOS_ACCEPT",
  PIN_CREATE = "PIN_CREATE",
  PROFILE_LOAD = "PROFILE_LOAD",
  PROFILE_UPSERT = "PROFILE_UPSERT",
  MESSAGES_LOAD = "MESSAGES_LOAD",
  MESSAGE_WITH_RELATIONS_LOAD = "MESSAGE_WITH_RELATIONS_LOAD",
  LOGOUT = "LOGOUT",
  PAYMENT = "PAYMENT",
  WALLET_MANAGEMENT_LOAD = "WALLET_MANAGEMENT_LOAD",
  FETCH_WALLETS = "FETCH_WALLET",
  FETCH_TRANSACTIONS = "FETCH_TRANSACTIONS"
}

// Extract keys from object and create a new union type
export type FetchRequestActionsType = keyof typeof FetchRequestActions;
