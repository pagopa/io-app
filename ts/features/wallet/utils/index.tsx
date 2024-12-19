import { WalletCard, WalletCardType } from "../types";
import { WalletCardBaseComponent } from "../components/WalletCardBaseComponent";
import { CgnWalletCard } from "../../bonus/cgn/components/CgnWalletCard";
import { IdPayWalletCard } from "../../idpay/wallet/components/IdPayWalletCard";
import { PaymentWalletCard } from "../../payments/wallet/components/PaymentWalletCard";
import { WalletCardSkeleton } from "../components/WalletCardSkeleton";
import { ItwCredentialWalletCard } from "../../itwallet/wallet/components/ItwCredentialWalletCard";

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
  itw: ItwCredentialWalletCard,
  placeholder: WalletCardSkeleton
};

export const renderWalletCardFn = (
  card: WalletCard,
  stacked: boolean = false
) => {
  const { key, category, type, ...cardProps } = card;
  const Component = walletCardComponentMapper[type];
  return Component ? (
    <Component
      key={key}
      testID={`walletCardTestID_${category}_${type}_${key}`}
      cardProps={cardProps}
      isStacked={stacked}
    />
  ) : null;
};
