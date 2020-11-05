/**
 * Return true if function is enabled for the wallet (aka payment method)
 * @param wallet
 */
import { EnableableFunctionsTypeEnum, PatchedWalletV2 } from "../types/pagopa";

export const hasFunctionEnabled = (
  wallet: PatchedWalletV2,
  walletFunction: EnableableFunctionsTypeEnum
) => wallet.enableableFunctions.includes(walletFunction);
