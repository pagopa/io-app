import { IUnitTag } from "italia-ts-commons/lib/units";
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { CobadgeResponse } from "../../../../../../../definitions/pagopa/walletv2/CobadgeResponse";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { RawCreditCardPaymentMethod } from "../../../../../../types/pagopa";
import { NetworkError } from "../../../../../../utils/errors";

type PrivativeQuery = {
  brand: string;
  cardNumber: string;
};

/**
 * Search for user's privative cards (can be only one)
 */
export const searchUserPrivative = createAsyncAction(
  "WALLET_ONBOARDING_PRIVATIVE_SEARCH_REQUEST",
  "WALLET_ONBOARDING_PRIVATIVE_SEARCH_SUCCESS",
  "WALLET_ONBOARDING_PRIVATIVE_SEARCH_FAILURE"
)<PrivativeQuery, PaymentInstrument, NetworkError>();

/**
 * The user adds a specific privative card to the wallet
 */
export const addPrivativeToWallet = createAsyncAction(
  "WALLET_ONBOARDING_PRIVATIVE_ADD_REQUEST",
  "WALLET_ONBOARDING_PRIVATIVE_ADD_SUCCESS",
  "WALLET_ONBOARDING_PRIVATIVE_ADD_FAILURE"
)<PaymentInstrument, RawCreditCardPaymentMethod, NetworkError>();

// TODO: placeholder type
type PrivativeService = IUnitTag<"PrivativeService">;
/**
 * Load the brand configuration for the privative services (the list of brand supported and the operational state)
 */
export const loadPrivativeBrandConfiguration = createAsyncAction(
  "WALLET_ONBOARDING_PRIVATIVE_LOAD_BRAND_CONFIG_REQUEST",
  "WALLET_ONBOARDING_PRIVATIVE_LOAD_BRAND_CONFIG_SUCCESS",
  "WALLET_ONBOARDING_PRIVATIVE_LOAD_BRAND_CONFIG_FAILURE"
)<void, PrivativeService, NetworkError>();

/**
 * The user chooses to start the workflow to add a new privative card to the wallet
 */
export const walletAddPrivativeStart = createStandardAction(
  "WALLET_ONBOARDING_PRIVATIVE_START"
)<string | undefined>();

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
  | ActionType<typeof loadPrivativeBrandConfiguration>
  | ActionType<typeof walletAddPrivativeStart>
  | ActionType<typeof walletAddPrivativeCompleted>
  | ActionType<typeof walletAddPrivativeCancel>
  | ActionType<typeof walletAddPrivativeBack>;
