import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * This action stores the Wallet Instance Attestation
 */
export const itwWalletInstanceAttestationStore = createStandardAction(
  "ITW_WALLET_INSTANCE_ATTESTATION_STORE"
)<string>();

export type ItwWiaActions = ActionType<
  typeof itwWalletInstanceAttestationStore
>;
