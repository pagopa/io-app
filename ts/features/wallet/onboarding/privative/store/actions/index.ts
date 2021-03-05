import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { PrivativeServices } from "../../../../../../../definitions/pagopa/privative/configuration/PrivativeServices";
import { CobadgeResponse } from "../../../../../../../definitions/pagopa/walletv2/CobadgeResponse";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { RawCreditCardPaymentMethod } from "../../../../../../types/pagopa";
import { NetworkError } from "../../../../../../utils/errors";
import { BrandId, SearchedPrivativeData } from "../reducers/searchedPrivative";

type PrivativeQuery = Required<SearchedPrivativeData>;

/**
 * Search for user's privative cards (can be only one)
 */
export const searchUserPrivative = createAsyncAction(
  "WALLET_ONBOARDING_PRIVATIVE_SEARCH_REQUEST",
  "WALLET_ONBOARDING_PRIVATIVE_SEARCH_SUCCESS",
  "WALLET_ONBOARDING_PRIVATIVE_SEARCH_FAILURE"
)<PrivativeQuery, CobadgeResponse, NetworkError>();

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
  "WALLET_ONBOARDING_PRIVATIVE_LOAD_PRIVATIVE_ISSUER_REQUEST",
  "WALLET_ONBOARDING_PRIVATIVE_LOAD_PRIVATIVE_ISSUER_SUCCESS",
  "WALLET_ONBOARDING_PRIVATIVE_LOAD_PRIVATIVE_ISSUER_FAILURE"
)<void, PrivativeServices, NetworkError>();

/**
 * The user chooses a brand to search a privative card
 */
export const walletAddPrivativeChooseBrand = createStandardAction(
  "WALLET_ONBOARDING_PRIVATIVE_CHOOSE_BRAND"
)<BrandId>();

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
  | ActionType<typeof walletAddPrivativeChooseBrand>
  | ActionType<typeof walletAddPrivativeStart>
  | ActionType<typeof walletAddPrivativeCompleted>
  | ActionType<typeof walletAddPrivativeCancel>
  | ActionType<typeof walletAddPrivativeBack>;
