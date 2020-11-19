import * as React from "react";
import { WalletTypeEnum } from "../../../../../../definitions/pagopa/walletv2/WalletV2";
import { PatchedWalletV2, WalletV2WithInfo } from "../../../../../types/pagopa";
import {
  getPaymentMethodHash,
  isCard
} from "../../../../../store/reducers/wallet/wallets";
import { CardInfo } from "../../../../../../definitions/pagopa/walletv2/CardInfo";
import BancomatBpdToggle from "./BancomatBpdToggle";
import { CardBpdToggle } from "./CardBpdToggle";

/**
 * Return a specific toggle based on the WalletTypeEnum
 * @param wallet
 */
export const bpdToggleFactory = (wallet: PatchedWalletV2) => {
  const walletWithInfo: WalletV2WithInfo<CardInfo> = {
    wallet,
    info: wallet.info
  };
  if (isCard(wallet, wallet.info)) {
    return wallet.walletType === WalletTypeEnum.Bancomat ? (
      <BancomatBpdToggle key={wallet.info.hashPan} card={walletWithInfo} />
    ) : (
      <CardBpdToggle key={wallet.info.hashPan} card={walletWithInfo} />
    );
  }
  // TODO: temp, default view with default icon
  return (
    <CardBpdToggle key={getPaymentMethodHash(wallet)} card={walletWithInfo} />
  );
};
