import * as React from "react";
import { WalletTypeEnum } from "../../../../../../definitions/pagopa/walletv2/WalletV2";
import { PatchedWalletV2 } from "../../../../../types/pagopa";
import BancomatBpdToggle from "./BancomatBpdToggle";
import { CardBpdToggle } from "./CardBpdToggle";

/**
 * Return a specific toggle based on the WalletTypeEnum
 * @param wallet
 */
export const bpdToggleFactory = (wallet: PatchedWalletV2) => {
  switch (wallet.walletType) {
    case WalletTypeEnum.Bancomat:
      return <BancomatBpdToggle key={wallet.info.hashPan} card={wallet} />;
    case WalletTypeEnum.Card:
      return <CardBpdToggle key={wallet.info.hashPan} card={wallet} />;
    default:
      // TODO: temp, default view with default icon
      return <CardBpdToggle key={wallet.info.hashPan} card={wallet} />;
  }
};
