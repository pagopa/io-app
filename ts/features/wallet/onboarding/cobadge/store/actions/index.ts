import { IUnitTag } from "italia-ts-commons/lib/units";
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { RawCreditCardPaymentMethod } from "../../../../../../types/pagopa";
import { NetworkError } from "../../../../../../utils/errors";

// TODO: replace with the response remote model
export type CoBadgeResponse = IUnitTag<"CoBadgeResponse">;

/**
 * Search for user's cobadge cards
 */
export const searchUserCoBadge = createAsyncAction(
  "WALLET_ONBOARDING_COBADGE_SEARCH_REQUEST",
  "WALLET_ONBOARDING_COBADGE_SEARCH_SUCCESS",
  "WALLET_ONBOARDING_COBADGE_SEARCH_FAILURE"
)<string | undefined, ReadonlyArray<CoBadgeResponse>, NetworkError>();

/**
 * The user adds a specific cobadge card to the wallet
 */
export const addCoBadgeToWallet = createAsyncAction(
  "WALLET_ONBOARDING_COBADGE_ADD_REQUEST",
  "WALLET_ONBOARDING_COBADGE_ADD_SUCCESS",
  "WALLET_ONBOARDING_COBADGE_ADD_FAILURE"
)<CoBadgeResponse, RawCreditCardPaymentMethod, NetworkError>();

/**
 * The user chooses to start the workflow to add a new cobadge to the wallet
 */
export const walletAddCoBadgeStart = createStandardAction(
  "WALLET_ONBOARDING_COBADGE_START"
)<void>();

/**
 * The user chooses to start the workflow to add a new cobadge from a bancomat (have a special handling)
 * TODO: keep this event ?
 */
export const walletAddCoBadgeFromBancomatStart = createStandardAction(
  "WALLET_ONBOARDING_COBADGE_START"
)<void>();

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
  | ActionType<typeof walletAddCoBadgeStart>
  | ActionType<typeof walletAddCoBadgeCompleted>
  | ActionType<typeof walletAddCoBadgeCancel>
  | ActionType<typeof walletAddCoBadgeBack>;
