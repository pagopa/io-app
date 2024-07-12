import * as React from "react";
import { WalletCard, WalletCardType } from "../types";
import { WalletCardBaseComponent } from "../components/WalletCardBaseComponent";
import { CgnWalletCard } from "../../bonus/cgn/components/CgnWalletCard";
import { IdPayWalletCard } from "../../idpay/wallet/components/IdPayWalletCard";
import { PaymentWalletCard } from "../../payments/wallet/components/PaymentWalletCard";
import { WalletCardSkeleton } from "../components/WalletCardSkeleton";

/**
 * Wallet card component mapper which translates a WalletCardType to a
 * component to be rendered inside the wallet.
 * Component MUST be a WalletCardBaseComponent, which can be created
 * using {@see withWalletCardBaseComponent} HOC
 */
export const walletCardComponentMapper: Record<
  WalletCardType,
  WalletCardBaseComponent<any> | undefined
> = {
  cgn: CgnWalletCard,
  idPay: IdPayWalletCard,
  payment: PaymentWalletCard,
  placeholder: WalletCardSkeleton
};

export const renderWalletCardFn = (
  card: WalletCard,
  stacked: boolean = false
) => {
  const Component = walletCardComponentMapper[card.type];
  return Component ? (
    <Component
      testID={`walletCardTestID_${card.key}`}
      cardProps={card}
      isStacked={stacked}
    />
  ) : null;
};
