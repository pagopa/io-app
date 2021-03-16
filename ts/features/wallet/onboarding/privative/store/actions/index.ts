import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { PrivativeServices } from "../../../../../../../definitions/pagopa/privative/configuration/PrivativeServices";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { SearchRequestMetadata } from "../../../../../../../definitions/pagopa/walletv2/SearchRequestMetadata";
import { RawCreditCardPaymentMethod } from "../../../../../../types/pagopa";
import { NetworkError } from "../../../../../../utils/errors";
import {
  PrivativeIssuerId,
  SearchedPrivativeData
} from "../reducers/searchedPrivative";

export type PrivativeQuery = Required<SearchedPrivativeData>;
export type PrivativeResponse = {
  paymentInstrument: PaymentInstrument | null;
  searchRequestId?: string;
  searchRequestMetadata: ReadonlyArray<SearchRequestMetadata>;
};

/**
 * Search for user's privative cards (can be only one)
 */
export const searchUserPrivative = createAsyncAction(
  "WALLET_ONBOARDING_PRIVATIVE_SEARCH_REQUEST",
  "WALLET_ONBOARDING_PRIVATIVE_SEARCH_SUCCESS",
  "WALLET_ONBOARDING_PRIVATIVE_SEARCH_FAILURE"
)<PrivativeQuery, PrivativeResponse, NetworkError>();

/**
 * The user adds a specific privative card to the wallet
 */
export const addPrivativeToWallet = createAsyncAction(
  "WALLET_ONBOARDING_PRIVATIVE_ADD_REQUEST",
  "WALLET_ONBOARDING_PRIVATIVE_ADD_SUCCESS",
  "WALLET_ONBOARDING_PRIVATIVE_ADD_FAILURE"
)<PaymentInstrument, RawCreditCardPaymentMethod, NetworkError>();

/**
 * Load the privative issuers configuration (the list of issuer that can issue a privative card )
 */
export const loadPrivativeIssuers = createAsyncAction(
  "WALLET_ONBOARDING_PRIVATIVE_LOAD_ISSUERS_REQUEST",
  "WALLET_ONBOARDING_PRIVATIVE_LOAD_ISSUERS_SUCCESS",
  "WALLET_ONBOARDING_PRIVATIVE_LOAD_ISSUERS_FAILURE"
)<void, PrivativeServices, NetworkError>();

/**
 * The user chooses a privative Issuer to search a privative card
 */
export const walletAddPrivativeChooseIssuer = createStandardAction(
  "WALLET_ONBOARDING_PRIVATIVE_CHOOSE_ISSUER"
)<PrivativeIssuerId>();

/**
 * The user chooses a privative Issuer to search a privative card
 */
export const walletAddPrivativeInsertCardNumber = createStandardAction(
  "WALLET_ONBOARDING_PRIVATIVE_INSERT_CARD_NUMBER"
)<string>();

/**
 * The user chooses to start the workflow to add a new privative card to the wallet
 */
export const walletAddPrivativeStart = createStandardAction(
  "WALLET_ONBOARDING_PRIVATIVE_START"
)<void>();

/**
 * The user completes the workflow to add a new privative card to the wallet
 * (at least one privative card has been added)
 */
export const walletAddPrivativeCompleted = createStandardAction(
  "WALLET_ONBOARDING_PRIVATIVE_COMPLETED"
)<void>();

/**
 * The user chooses to cancel the addition of a privative card to the wallet (no privative card has been added)
 */
export const walletAddPrivativeCancel = createStandardAction(
  "WALLET_ONBOARDING_PRIVATIVE_CANCEL"
)<void>();

/**
 * The user chooses `back` from the first screen
 */
export const walletAddPrivativeBack = createStandardAction(
  "WALLET_ONBOARDING_PRIVATIVE_BACK"
)<void>();

export type PrivativeActions =
  | ActionType<typeof searchUserPrivative>
  | ActionType<typeof addPrivativeToWallet>
  | ActionType<typeof loadPrivativeIssuers>
  | ActionType<typeof walletAddPrivativeChooseIssuer>
  | ActionType<typeof walletAddPrivativeInsertCardNumber>
  | ActionType<typeof walletAddPrivativeStart>
  | ActionType<typeof walletAddPrivativeCompleted>
  | ActionType<typeof walletAddPrivativeCancel>
  | ActionType<typeof walletAddPrivativeBack>;
