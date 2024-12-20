import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletInstanceStatus } from "../../../common/utils/itwTypesUtils";

/**
 * This action stores the Wallet Instance Attestation
 */
export const itwWalletInstanceAttestationStore = createStandardAction(
  "ITW_WALLET_INSTANCE_ATTESTATION_STORE"
)<string>();

/**
 * This action update the Wallet Instance Status
 */
export const itwUpdateWalletInstanceStatus = createStandardAction(
  "ITW_WALLET_INSTANCE_STATUS_UPDATE"
)<WalletInstanceStatus | undefined>();

export type ItwWalletInstanceActions =
  | ActionType<typeof itwWalletInstanceAttestationStore>
  | ActionType<typeof itwUpdateWalletInstanceStatus>;
