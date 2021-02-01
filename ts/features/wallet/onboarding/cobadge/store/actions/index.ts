import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { RawCreditCardPaymentMethod } from "../../../../../../types/pagopa";
import { NetworkError } from "../../../../../../utils/errors";
import { CoBadgeServices } from "../../../../../../../definitions/pagopa/cobadge/configuration/CoBadgeServices";
import { CobadgeResponse } from "../../../../../../../definitions/pagopa/walletv2/CobadgeResponse";

/**
 * Search for user's cobadge cards
 */
export const searchUserCoBadge = createAsyncAction(
  "WALLET_ONBOARDING_COBADGE_SEARCH_REQUEST",
  "WALLET_ONBOARDING_COBADGE_SEARCH_SUCCESS",
  "WALLET_ONBOARDING_COBADGE_SEARCH_FAILURE"
)<string | undefined, CobadgeResponse, NetworkError>();

/**
 * The user adds a specific cobadge card to the wallet
 */
export const addCoBadgeToWallet = createAsyncAction(
  "WALLET_ONBOARDING_COBADGE_ADD_REQUEST",
  "WALLET_ONBOARDING_COBADGE_ADD_SUCCESS",
  "WALLET_ONBOARDING_COBADGE_ADD_FAILURE"
)<PaymentInstrument, RawCreditCardPaymentMethod, NetworkError>();

/**
 * Load the Abi configuration for the cobadge services (the list of abi supported and the operational state)
 */
export const loadCoBadgeAbiConfiguration = createAsyncAction(
  "WALLET_ONBOARDING_COBADGE_LOAD_ABI_CONFIG_REQUEST",
  "WALLET_ONBOARDING_COBADGE_LOAD_ABI_CONFIG_SUCCESS",
  "WALLET_ONBOARDING_COBADGE_LOAD_ABI_CONFIG_FAILURE"
)<void, CoBadgeServices, NetworkError>();

/**
 * The user chooses to start the workflow to add a new cobadge to the wallet
 */
export const walletAddCoBadgeStart = createStandardAction(
  "WALLET_ONBOARDING_COBADGE_START"
)<void>();

/**
 * The user chooses to start the workflow to add a new cobadge from a bancomat (have a special handling)
 * TODO: Remove
 */
export const walletAddCoBadgeFromBancomatStart = createStandardAction(
  "WALLET_ONBOARDING_COBADGE_START_FROM_BANCOMAT"
)<string | undefined>();

/**
 * The user completes the workflow to add a new cobadge card to the wallet
 * (at least one cobadge has been added)
 */
export const walletAddCoBadgeCompleted = createStandardAction(
  "WALLET_ONBOARDING_COBADGE_COMPLETED"
)<void>();

/**
 * The user chooses to cancel the addition of a cobadge to the wallet (no cobadge has been added)
 */
export const walletAddCoBadgeCancel = createStandardAction(
  "WALLET_ONBOARDING_COBADGE_CANCEL"
)<void>();

/**
 * The user chooses `back` from the first screen
 */
export const walletAddCoBadgeBack = createStandardAction(
  "WALLET_ONBOARDING_COBADGE_BACK"
)<void>();

export type CoBadgeActions =
  | ActionType<typeof searchUserCoBadge>
  | ActionType<typeof addCoBadgeToWallet>
  | ActionType<typeof loadCoBadgeAbiConfiguration>
  | ActionType<typeof walletAddCoBadgeStart>
  | ActionType<typeof walletAddCoBadgeFromBancomatStart>
  | ActionType<typeof walletAddCoBadgeCompleted>
  | ActionType<typeof walletAddCoBadgeCancel>
  | ActionType<typeof walletAddCoBadgeBack>;
