import { PatchedWalletV2 } from "../../../types/pagopa";

/**
 * Return true if bpd is enabled for the wallet (aka payment method)
 * TODO: replace string with enum
 * @param wallet
 */
export const hasBpdCapability = (wallet: PatchedWalletV2) =>
  wallet.enableableFunctions.includes("BPD");
