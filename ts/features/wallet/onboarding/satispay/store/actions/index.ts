import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { AbiListResponse } from "../../../../../../../definitions/pagopa/walletv2/AbiListResponse";
import { Card } from "../../../../../../../definitions/pagopa/walletv2/Card";
import { RawBancomatPaymentMethod } from "../../../../../../types/pagopa";

/**
 * Request the satispay account for the user
 */
export const searchUserSatispay = createAsyncAction(
  "WALLET_LOAD_SATISPAY_REQUEST",
  "WALLET_LOAD_SATISPAY_SUCCESS",
  "WALLET_LOAD_SATISPAY_FAILURE"
)<void, AbiListResponse, Error>();

/**
 * The user add the satispay account to the wallet
 */
export const addSatispayToWallet = createAsyncAction(
  "WALLET_ONBOARDING_SATISPAY_ADD_REQUEST",
  "WALLET_ONBOARDING_SATISPAY_ADD_SUCCESS",
  "WALLET_ONBOARDING_SATISPAY_ADD_FAILURE"
)<Card, RawBancomatPaymentMethod, Error>();

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
  | ActionType<typeof walletAddSatispayBack>;
