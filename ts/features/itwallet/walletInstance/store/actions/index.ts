import { WalletInstanceData } from "@pagopa/io-react-native-wallet/lib/typescript/client/generated/wallet-provider";
import { ActionType, createStandardAction } from "typesafe-actions";

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
  "ITW_WALLET_INSTANCE__STATUS_UPDATE"
)<WalletInstanceData>();

export type ItwWalletInstanceActions =
  | ActionType<typeof itwWalletInstanceAttestationStore>
  | ActionType<typeof itwUpdateWalletInstanceStatus>;
