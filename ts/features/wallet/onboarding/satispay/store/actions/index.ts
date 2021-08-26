import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { Satispay } from "../../../../../../../definitions/pagopa/walletv2/Satispay";
import { RawSatispayPaymentMethod } from "../../../../../../types/pagopa";
import { NetworkError } from "../../../../../../utils/errors";

/**
 * Request the satispay account for the user
 */
export const searchUserSatispay = createAsyncAction(
  "WALLET_ONBOARDING_SATISPAY_LOAD_REQUEST",
  "WALLET_ONBOARDING_SATISPAY_LOAD_SUCCESS",
  "WALLET_ONBOARDING_SATISPAY_LOAD_FAILURE"
)<void, Satispay | null, NetworkError>();

/**
 * The user add the satispay account to the wallet
 */
export const addSatispayToWallet = createAsyncAction(
  "WALLET_ONBOARDING_SATISPAY_ADD_REQUEST",
  "WALLET_ONBOARDING_SATISPAY_ADD_SUCCESS",
  "WALLET_ONBOARDING_SATISPAY_ADD_FAILURE"
)<Satispay, RawSatispayPaymentMethod, Error>();

/**
 * The user choose to start the workflow to add a new satispay account to the wallet
 */
export const walletAddSatispayStart = createStandardAction(
  "WALLET_ONBOARDING_SATISPAY_START"
)<void>();

/**
 * The user complete the workflow to add a new satispay account to the wallet
 */
export const walletAddSatispayCompleted = createStandardAction(
  "WALLET_ONBOARDING_SATISPAY_COMPLETED"
)<void>();

/**
 * The user choose to cancel the addition of a new satispay account to the wallet
 */
export const walletAddSatispayCancel = createStandardAction(
  "WALLET_ONBOARDING_SATISPAY_CANCEL"
)<void>();

/**
 * The workflow fails
 */
export const walletAddSatispayFailure = createStandardAction(
  "WALLET_ONBOARDING_SATISPAY_FAILURE"
)<string>();

/**
 * The user choose `back` from the first screen
 */
export const walletAddSatispayBack = createStandardAction(
  "WALLET_ONBOARDING_SATISPAY_BACK"
)<void>();

export type SatispayActions =
  | ActionType<typeof searchUserSatispay>
  | ActionType<typeof addSatispayToWallet>
  | ActionType<typeof walletAddSatispayStart>
  | ActionType<typeof walletAddSatispayCompleted>
  | ActionType<typeof walletAddSatispayCancel>
  | ActionType<typeof walletAddSatispayFailure>
  | ActionType<typeof walletAddSatispayBack>;
